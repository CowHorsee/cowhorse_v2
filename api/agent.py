import os

from openai import AzureOpenAI

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


def run_connectivity_check() -> int:
    if load_dotenv is not None:
        load_dotenv()

    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    if not endpoint or not api_key:
        print('Missing required environment variables: AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY')
        return 1

    deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4.1')
    api_version = os.getenv('AZURE_OPENAI_API_VERSION', '2024-06-01')

    print('Endpoint:', endpoint)
    print('Deployment:', deployment)
    print('API Version:', api_version)

    client = AzureOpenAI(
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=api_version,
    )

    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[{'role': 'user', 'content': 'Reply with: CONNECTION_SUCCESS'}],
            max_tokens=24,
        )
    except Exception as err:
        print(f'Deployment {deployment} failed: {err}')
        print('Set AZURE_OPENAI_DEPLOYMENT only if your confirmed deployment name is different.')
        return 2

    content = response.choices[0].message.content if response.choices else None
    if content:
        print(content)
        return 0

    print('Request succeeded but empty content was returned.')
    return 3


if __name__ == '__main__':
    raise SystemExit(run_connectivity_check())
