'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Utility function to validate JSON
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Utility function to calculate diff between two JSON objects
function jsonDiff(str1: string, str2: string): { left: string[], right: string[], hasDiff: boolean } {
  const lines1 = str1.split('\n');
  const lines2 = str2.split('\n');
  const left: string[] = [];
  const right: string[] = [];
  let hasDiff = false;
  let i = 0, j = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      left.push('');
      right.push(`+ ${lines2[j]}`);
      j++;
      hasDiff = true;
    } else if (j >= lines2.length) {
      left.push(`- ${lines1[i]}`);
      right.push('');
      i++;
      hasDiff = true;
    } else if (lines1[i] === lines2[j]) {
      left.push(`  ${lines1[i]}`);
      right.push(`  ${lines2[j]}`);
      i++;
      j++;
    } else {
      left.push(`- ${lines1[i]}`);
      right.push(`+ ${lines2[j]}`);
      i++;
      j++;
      hasDiff = true;
    }
  }

  return { left, right, hasDiff };
}

function JsonValidator({ json, setJson, validate }: { json: string, setJson: (value: string) => void, validate: () => void }) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter JSON here..."
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={10}
        className="font-mono text-sm"
      />
      <Button onClick={validate} className="w-full">Validate JSON</Button>
    </div>
  )
}

function JsonDiff({ json1, setJson1, json2, setJson2, compare }: { 
  json1: string, 
  setJson1: (value: string) => void, 
  json2: string, 
  setJson2: (value: string) => void, 
  compare: () => void 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Textarea
          placeholder="Enter first JSON here..."
          value={json1}
          onChange={(e) => setJson1(e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
        <Textarea
          placeholder="Enter second JSON here..."
          value={json2}
          onChange={(e) => setJson2(e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
      <Button onClick={compare} className="w-full">Compare JSON</Button>
    </div>
  )
}

function SideBySideDiffViewer({ diff }: { diff: { left: string[], right: string[] } }) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg overflow-hidden shadow-lg">
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 overflow-auto max-h-96 text-sm font-mono">
        {diff.left.map((line, index) => {
          let className = "block";
          if (line.startsWith('-')) {
            className += " text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
          }
          return (
            <div key={`left-${index}`} className="flex">
              <span className="w-8 inline-block text-gray-500 select-none">{index + 1}</span>
              <span className={className}>{line}</span>
            </div>
          );
        })}
      </pre>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 overflow-auto max-h-96 text-sm font-mono">
        {diff.right.map((line, index) => {
          let className = "block";
          if (line.startsWith('+')) {
            className += " text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
          }
          return (
            <div key={`right-${index}`} className="flex">
              <span className="w-8 inline-block text-gray-500 select-none">{index + 1}</span>
              <span className={className}>{line}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export default function JsonTool() {
  const [json, setJson] = useState('')
  const [json1, setJson1] = useState('')
  const [json2, setJson2] = useState('')
  const [result, setResult] = useState<{ type: 'validation' | 'diff' | 'error', content: string | { left: string[], right: string[] } }>({ type: 'validation', content: '' })
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const validateJson = () => {
    if (isValidJSON(json)) {
      setResult({ type: 'validation', content: 'Valid JSON' });
    } else {
      setResult({ type: 'validation', content: 'Invalid JSON' });
    }
  }

  const compareJson = () => {
    if (isValidJSON(json1) && isValidJSON(json2)) {
      const formattedJson1 = JSON.stringify(JSON.parse(json1), null, 2);
      const formattedJson2 = JSON.stringify(JSON.parse(json2), null, 2);
      const { left, right, hasDiff } = jsonDiff(formattedJson1, formattedJson2);
      
      if (hasDiff) {
        setResult({ type: 'diff', content: { left, right } });
      } else {
        setResult({ type: 'validation', content: 'No differences found. The JSON objects are identical.' });
      }
    } else {
      setResult({ type: 'error', content: 'Both inputs must be valid JSON' });
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-8 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">JSON Validator and Diff Tool</CardTitle>
          <CardDescription className="text-lg">Validate JSON syntax and compare two JSON objects</CardDescription>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="validate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="validate">Validate JSON</TabsTrigger>
              <TabsTrigger value="diff">Compare JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="validate">
              <JsonValidator json={json} setJson={setJson} validate={validateJson} />
            </TabsContent>
            <TabsContent value="diff">
              <JsonDiff json1={json1} setJson1={setJson1} json2={json2} setJson2={setJson2} compare={compareJson} />
            </TabsContent>
          </Tabs>
          <AnimatePresence mode="wait">
            <motion.div
              key={result.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Result:</h3>
              {result.type === 'validation' && (
                <Alert variant={result.content === 'Valid JSON' ? 'default' : 'destructive'}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Validation Result</AlertTitle>
                  <AlertDescription>
                    {typeof result.content === 'string' ? result.content : ''}
                  </AlertDescription>
                </Alert>
              )}
              {result.type === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {typeof result.content === 'string' 
                      ? result.content 
                      : JSON.stringify(result.content)}
                  </AlertDescription>
                </Alert>
              )}
              {result.type === 'diff' && (
                <SideBySideDiffViewer diff={result.content as { left: string[], right: string[] }} />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

