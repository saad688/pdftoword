import React, { useState, useEffect } from 'react';
import { X, FileText, Zap, Download, Edit3, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface OnboardingGuideProps {
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Welcome to PDF to Word Converter",
      description: "Transform your PDF documents into editable Word files using advanced AI technology.",
      icon: <FileText className="w-12 h-12 text-blue-500" />,
      content: "Our AI-powered service converts PDFs to Word documents with high accuracy, preserving formatting and structure."
    },
    {
      title: "Upload Your PDF",
      description: "Simply drag and drop or click to select your PDF file.",
      icon: <Zap className="w-12 h-12 text-green-500" />,
      content: "Supports files up to 150MB. Multiple file upload available for batch processing."
    },
    {
      title: "AI Processing & Review",
      description: "Watch as our AI processes your document, then review the extracted text.",
      icon: <Edit3 className="w-12 h-12 text-purple-500" />,
      content: "After processing completes, review the results and use AI correction to fix any mistakes by selecting text and explaining what needs to be corrected."
    },
    {
      title: "Correct & Download",
      description: "Use AI to correct any mistakes, then download your perfect Word document.",
      icon: <Download className="w-12 h-12 text-orange-500" />,
      content: "Right-click any text to use AI correction, make final edits, then download as DOCX or export to other formats (PDF, HTML, RTF, TXT)."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-8">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {currentStepData.icon}
            </div>
            
            <h2 className="text-2xl font-bold mb-4">
              {currentStepData.title}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{currentStepData.content}</p>
              {currentStep === 2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-blue-800 font-medium">💡 Pro Tip:</p>
                  <p className="text-blue-700 text-xs">Select any text and right-click to access AI correction. Explain what's wrong and our AI will fix it instantly!</p>
                </div>
              )}
              {currentStep === 3 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-green-800 font-medium">🎯 Final Step:</p>
                  <p className="text-green-700 text-xs">Once you're satisfied with the text, click the download button to get your Word document. You can also export to other formats!</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tutorial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;