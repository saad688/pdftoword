#!/usr/bin/env python3
"""
Test script to verify google-genai migration works correctly.
"""

import os
import sys
from pathlib import Path
import dotenv

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_genai_import():
    """Test that google-genai can be imported and configured."""
    try:
        import google.genai as genai
        print("✓ Successfully imported google.genai")
        
        dotenv.load_dotenv()
        # Test configuration
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("⚠ Warning: GEMINI_API_KEY not found in environment")
            return False

        client = genai.Client(api_key=api_key)
        print("✓ Successfully created google.genai client with API key")
        return True

    except ImportError as e:
        print(f"✗ Failed to import google.genai: {e}")
        return False
    except Exception as e:
        print(f"✗ Failed to configure google.genai: {e}")
        return False

def test_model_creation():
    """Test that we can create a GenerativeModel."""
    try:
        import google.genai as genai

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("⚠ Skipping model creation test - no API key")
            return True

        client = genai.Client(api_key=api_key)
        model = client.models.get("gemini-2.5-flash")
        print("✓ Successfully created model using client")
        return True

    except Exception as e:
        print(f"✗ Failed to create GenerativeModel: {e}")
        return False

def test_converter_import():
    """Test that our EnhancedGeminiConverter can be imported."""
    try:
        from gemini_converter_enhanced import EnhancedGeminiConverter
        print("✓ Successfully imported EnhancedGeminiConverter")
        return True

    except ImportError as e:
        print(f"✗ Failed to import EnhancedGeminiConverter: {e}")
        return False
    except Exception as e:
        print(f"✗ Error with EnhancedGeminiConverter: {e}")
        return False

def test_converter_initialization():
    """Test that we can initialize the converter."""
    try:
        from gemini_converter_enhanced import EnhancedGeminiConverter

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("⚠ Skipping converter initialization test - no API key")
            return True

        converter = EnhancedGeminiConverter(api_key=api_key)
        print("✓ Successfully initialized EnhancedGeminiConverter")
        return True

    except Exception as e:
        print(f"✗ Failed to initialize EnhancedGeminiConverter: {e}")
        return False

def main():
    """Run all tests."""
    print("Testing google-genai migration...")
    print("=" * 50)

    tests = [
        test_genai_import,
        test_model_creation,
        test_converter_import,
        test_converter_initialization,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        print(f"\nRunning {test.__name__}...")
        if test():
            passed += 1
        else:
            print(f"Test {test.__name__} failed!")

    print("\n" + "=" * 50)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Migration appears successful.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)