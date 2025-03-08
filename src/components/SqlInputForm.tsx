import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useSqlStore } from '../store/sqlStore';
import exampleSql from '../example/example1.sql?raw';

const SqlInputForm: React.FC = () => {
  const { sqlScript, setSqlScript, processSqlScript, error, isLoading } = useSqlStore();
  const [sqlUrl, setSqlUrl] = useState('');
  
  const handleProcessClick = () => {
    processSqlScript();
  };
  
  const handleLoadExample = () => {
    setSqlScript(exampleSql);
  };
  
  const handleFetchFromUrl = async () => {
    if (!sqlUrl) return;
    
    try {
      const response = await fetch(sqlUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch SQL script: ${response.statusText}`);
      }
      
      const sqlText = await response.text();
      setSqlScript(sqlText);
    } catch (error) {
      alert(`Error fetching SQL script: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SQL Script Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Input 
              placeholder="Enter URL to SQL script (optional)" 
              value={sqlUrl}
              onChange={(e) => setSqlUrl(e.target.value)}
            />
            <Button 
              onClick={handleFetchFromUrl}
              variant="outline"
              disabled={!sqlUrl}
            >
              Fetch
            </Button>
          </div>
          
          <Textarea
            placeholder="Paste your SQL Server script here..."
            className="min-h-[200px] font-mono"
            value={sqlScript}
            onChange={(e) => setSqlScript(e.target.value)}
          />
          
          <div className="mt-2 flex justify-end">
            <Button 
              onClick={handleLoadExample}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              Load Example
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleProcessClick}
          disabled={isLoading || !sqlScript.trim()}
        >
          {isLoading ? 'Processing...' : 'Process SQL Script'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SqlInputForm; 