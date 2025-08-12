import { useState } from "react";
import { Brain, Lightbulb, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalysisResult {
  cognitiveDistortions: string[];
  severity: 'low' | 'moderate' | 'high';
  suggestions: string[];
  reframingExamples: string[];
  strengths: string[];
}

interface AIAnalysisCardProps {
  analysis: AnalysisResult;
  className?: string;
}

export default function AIAnalysisCard({ analysis, className = "" }: AIAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`border-0 bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Analysis</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Severity Badge */}
        <div className="flex items-center space-x-2">
          <Badge className={`${getSeverityColor(analysis.severity)} border`}>
            {getSeverityIcon(analysis.severity)}
            <span className="ml-1 capitalize">{analysis.severity} intensity</span>
          </Badge>
        </div>

        {/* Strengths - Always show */}
        {analysis.strengths.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-800">Strengths</h4>
            </div>
            <ul className="space-y-1">
              {analysis.strengths.slice(0, isExpanded ? undefined : 2).map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
            {!isExpanded && analysis.strengths.length > 2 && (
              <p className="text-xs text-green-600 mt-1">
                +{analysis.strengths.length - 2} more strengths
              </p>
            )}
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Cognitive Distortions */}
            {analysis.cognitiveDistortions.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-orange-800">Thought Patterns to Notice</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.cognitiveDistortions.map((distortion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {distortion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reframing Examples */}
            {analysis.reframingExamples.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Questions to Consider</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.reframingExamples.map((example, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-purple-800">Suggestions</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-purple-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Collapsed hint */}
        {!isExpanded && (
          <p className="text-xs text-gray-600 text-center">
            Tap to see detailed analysis and suggestions
          </p>
        )}
      </CardContent>
    </Card>
  );
}