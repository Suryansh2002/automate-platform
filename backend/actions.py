import asyncio
from playwright.async_api import async_playwright, Page
from playwright_stealth import Stealth # pyright: ignore
from typing import Any

async def wait_load(page: Page):
    await page.wait_for_load_state("networkidle")
    await page.wait_for_load_state("domcontentloaded")

async def send_instagram_message(*, session_id: str, author_username: str = "instagram", message: str = "Hello from Playwright Stealth!"):
    async with Stealth().use_async(async_playwright()) as p:
        browser = await p.chromium.launch(headless=True)
        iphone: Any = p.devices['iPhone 12'] # pyright: ignore
        context = await browser.new_context(
            **iphone, # pyright: ignore
        )
        await context.add_cookies([{
            'name': 'sessionid',
            'value': session_id,
            'domain': '.instagram.com',
            'path': '/',
            'secure': True,
            'httpOnly': True,
        }])
        page = await context.new_page()
        await page.goto(f"https://ig.me/m/{author_username}", wait_until="domcontentloaded")
        await wait_load(page)
        await asyncio.sleep(1)
        try:
            await page.click("text=Not Now", timeout=2000)
        except Exception:
            pass

        message_box = page.locator('div[role="textbox"][aria-label="Message"][contenteditable="true"]')
        try:
            await message_box.wait_for(state="visible", timeout=6000)
        except Exception:
            return "Private account or blocked."
        await message_box.click()
        await message_box.type(message, delay=100)
        await page.keyboard.press("Enter")
        await wait_load(page)
        await asyncio.sleep(1)

async def check_new_responses(session_id: str) -> str|None:
    async with Stealth().use_async(async_playwright()) as p:
        browser = await p.chromium.launch(headless=True)
        iphone: Any = p.devices['iPhone 12'] # pyright: ignore
        context = await browser.new_context(
            **iphone, # pyright: ignore
        )
        await context.add_cookies([{
            'name': 'sessionid',
            'value': session_id,
            'domain': '.instagram.com',
            'path': '/',
            'secure': True,
            'httpOnly': True,
        }])
        page = await context.new_page()

        for page_url in ["https://www.instagram.com/direct/inbox/", "https://www.instagram.com/direct/requests/"]:
            await page.goto(page_url, wait_until="domcontentloaded")
            await wait_load(page)
            await asyncio.sleep(1)
            try:
                await page.click("text=Not Now", timeout=1500)
            except Exception:
                pass
            
            unread_users = page.get_by_text("Unread", exact=True)
            if await unread_users.count() == 0:
                continue

            await unread_users.click()
            await wait_load(page)
            await asyncio.sleep(2)
            if page_url == "https://www.instagram.com/direct/requests/":
                await page.get_by_role("button", name="Accept").click(timeout=2000)
                await wait_load(page)
                await asyncio.sleep(1)
            await read_and_respond_to_messages(page)


async def read_and_respond_to_messages(page: Page):
    from ai import respond_to_new_messages

    messages:list[dict[str, Any]] = []
    bubbles = page.locator('div[dir="auto"]') 
    for bubble in await bubbles.all():
        text = await bubble.inner_text()
        is_me = await bubble.evaluate("""(el) => {
            let current = el;
            for (let i = 0; i < 7; i++) {
                if (!current.parentElement) break;
                current = current.parentElement;
                
                const style = window.getComputedStyle(current);
                if (style.justifyContent === 'flex-end' || style.alignItems === 'flex-end') {
                    return true;
                }
            }
            return false;
        }""")
        if text:
            messages.append({"text": text, "is_me": is_me})
    formatted_messages = ""
    for msg in messages:
        if msg["is_me"]:
            formatted_messages += f"You: {msg['text']}\n"
        else:
            formatted_messages += f"User: {msg['text']}\n"
    
    message = await respond_to_new_messages(formatted_messages)

    message_box = page.locator('div[role="textbox"][aria-label="Message"][contenteditable="true"]')
    await message_box.wait_for(state="visible", timeout=10000)
    await message_box.click()
    await message_box.type(message, delay=100)
    await page.keyboard.press("Enter")
    await asyncio.sleep(1)
    await page.wait_for_load_state("domcontentloaded")