from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.init import init_db
from routes.init import router
import time

app = FastAPI()

@app.on_event("startup")
def startup():
    for i in range(10):
        try:
            init_db()
            print("✅ Database connected successfully")
            break
        except Exception as e:
            print(f"❌ DB not ready, retrying... ({i+1}/10)", e)
            time.sleep(3)
    else:
        print("❌ Failed to connect to DB after retries")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3100",
        "http://127.0.0.1:3100",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Hello World"}