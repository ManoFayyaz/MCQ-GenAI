#local packages in my environment

from setuptools import setup, find_packages

setup(
    name="mcq_genai",
    version="0.1.0",
    author="Mehnoor Fayyaz",
    author_email="mehnoorfayyaz06@gmail.com",
    install_requires=[
        "openai",
        "python-dotenv",
        "streamlit",
        "langchain",
        "PyPDF2"
    ],
    packages=find_packages()
)