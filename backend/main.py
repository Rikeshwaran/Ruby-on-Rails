from fastapi import FastAPI
from database.init import init_db

init_db()


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}