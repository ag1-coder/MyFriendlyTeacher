#!/usr/bin/env python3
"""
Test script to diagnose Claude API issues
"""
import requests
import sys

def test_api_key(api_key):
    """Test the API key with different models"""

    models_to_test = [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620',
        'claude-3-sonnet-20240229',
        'claude-3-opus-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
    ]

    print(f"Testing API key: {api_key[:10]}...")
    print("=" * 60)

    for model in models_to_test:
        print(f"\nTesting model: {model}")

        headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
        }

        payload = {
            'model': model,
            'max_tokens': 10,
            'messages': [{
                'role': 'user',
                'content': 'Hi'
            }]
        }

        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                print(f"  ✅ SUCCESS! This model works!")
                return model
            else:
                error_data = response.json()
                error_type = error_data.get('error', {}).get('type', 'unknown')
                error_msg = error_data.get('error', {}).get('message', 'No message')
                print(f"  ❌ {response.status_code}: {error_type} - {error_msg}")

        except Exception as e:
            print(f"  ❌ Exception: {str(e)}")

    print("\n" + "=" * 60)
    print("❌ No working models found!")
    print("\nPossible issues:")
    print("1. API key doesn't have billing enabled")
    print("2. Account needs credits added")
    print("3. API key might be invalid")
    print("\nPlease check: https://console.anthropic.com/settings/billing")
    return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 test_api.py YOUR_API_KEY")
        sys.exit(1)

    api_key = sys.argv[1]
    working_model = test_api_key(api_key)

    if working_model:
        print(f"\n✅ Working model found: {working_model}")
        print(f"Update server.py to use: CLAUDE_MODEL = '{working_model}'")
