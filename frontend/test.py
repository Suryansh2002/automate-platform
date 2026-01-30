import asyncio

async def continous_check():
    await asyncio.sleep(0.1)

async def main():
    res = await asyncio.wait_for(continous_check(), timeout=1)
    print("Completed:", res)

if __name__ == "__main__":
    asyncio.run(main())