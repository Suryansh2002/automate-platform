**This is just a prototype showcasing the implementation of AI automating of platforms like instagram with Playright and OpenAi**

## STEPS TO RUN

1) Install python and poetry and run backend with poetry using
    `poetry install`; `playwright install`; and `poetry run python run.py`

2) Install nodejs on your system and Use pnpm/npm and run using `pnpm install` and `pnpm run dev`

1) Make sure you are logged in on instagram on your pc

2) Donwload and Install the extensions on your browswer

3) Find the extension ID in your chrome://extensions and input

3) Use Chat to send messages to people and AI will also automatically to incoming messages.


## Working

1) Extensions fetches the instagram token and sends it to the python backend

2) Backend is responsible sending messaging to instagram

3) Backend also keeps looping at regular to check if new messages have come