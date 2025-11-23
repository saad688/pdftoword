import unittest
from gemini_converter_enhanced import EnhancedGeminiConverter
import os

class TestGeminiConverterUnicode(unittest.TestCase):
    def setUp(self):
        # Mock API key to avoid initialization error
        os.environ['GEMINI_API_KEY'] = 'test_key'
        self.converter = EnhancedGeminiConverter(api_key='test_key')

    def test_unicode_conversion_method(self):
        # Test the internal method directly
        self.assertEqual(self.converter._convert_latex_to_unicode("x^{2}"), "x²")
        self.assertEqual(self.converter._convert_latex_to_unicode("H_{2}O"), "H₂O")
        self.assertEqual(self.converter._convert_latex_to_unicode("x^{Q}"), "x⁽Q⁾") # Fallback
        self.assertEqual(self.converter._convert_latex_to_unicode("x_{z}"), "x₍z₎") # Fallback

    def test_apply_unicode_conversion(self):
        # Test the recursive application
        data = {
            "pages": [
                {
                    "blocks": [
                        {"text": "Area = x^{2}"},
                        {"text": "Water is H_{2}O"}
                    ]
                }
            ]
        }
        self.converter._apply_unicode_conversion(data)
        
        self.assertEqual(data["pages"][0]["blocks"][0]["text"], "Area = x²")
        self.assertEqual(data["pages"][0]["blocks"][1]["text"], "Water is H₂O")

if __name__ == '__main__':
    unittest.main()
