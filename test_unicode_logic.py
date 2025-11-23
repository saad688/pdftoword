import unittest
import re

# --- MAPPINGS ---
SUPERSCRIPT_MAP = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
}

SUBSCRIPT_MAP = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
}

def to_superscript(char):
    return SUPERSCRIPT_MAP.get(char, f"⁽{char}⁾")

def to_subscript(char):
    return SUBSCRIPT_MAP.get(char, f"₍{char}₎")

def convert_latex_to_unicode(text):
    """
    Converts LaTeX-style superscripts (^{...}) and subscripts (_{...}) to Unicode.
    Handles nested braces by simple regex (limitations apply but sufficient for this use case).
    """
    
    # Process Superscripts: ^{...}
    def replace_sup(match):
        content = match.group(1)
        return "".join(to_superscript(c) for c in content)
    
    # Process Subscripts: _{...}
    def replace_sub(match):
        content = match.group(1)
        return "".join(to_subscript(c) for c in content)

    # Regex for ^{...} and _{...}
    # Note: This simple regex assumes no nested braces inside the content itself
    text = re.sub(r'\^\{([^\}]+)\}', replace_sup, text)
    text = re.sub(r'_\{([^\}]+)\}', replace_sub, text)
    
    return text

class TestUnicodeConversion(unittest.TestCase):
    def test_basic_numbers(self):
        self.assertEqual(convert_latex_to_unicode("x^{2}"), "x²")
        self.assertEqual(convert_latex_to_unicode("H_{2}O"), "H₂O")
        
    def test_full_alphabet_sup(self):
        # Testing a few known ones and a fallback
        self.assertEqual(convert_latex_to_unicode("x^{A}"), "xᴬ")
        self.assertEqual(convert_latex_to_unicode("x^{Q}"), "x⁽Q⁾") # Fallback
        
    def test_full_alphabet_sub(self):
        self.assertEqual(convert_latex_to_unicode("x_{a}"), "xₐ")
        self.assertEqual(convert_latex_to_unicode("x_{z}"), "x₍z₎") # Fallback
        
    def test_mixed(self):
        self.assertEqual(convert_latex_to_unicode("CO_{2}"), "CO₂")
        self.assertEqual(convert_latex_to_unicode("E=mc^{2}"), "E=mc²")
        
    def test_complex_string(self):
        # "The variable x_{i} squared is x_{i}^{2}"
        input_str = "The variable x_{i} squared is x_{i}^{2}"
        expected = "The variable xᵢ squared is xᵢ²"
        self.assertEqual(convert_latex_to_unicode(input_str), expected)

if __name__ == '__main__':
    unittest.main()
