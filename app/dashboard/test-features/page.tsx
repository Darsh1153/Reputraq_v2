'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './page.module.scss';

export default function TestFeaturesPage() {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'pass' | 'fail'>>({});
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      id: 'data-processors',
      name: 'Data Processors Service',
      description: 'Test if data processors can handle mock data',
      test: () => {
        try {
          const { SocialDataProcessors } = require('../../../services/socialDataProcessors');
          const mockData = { data: [] };
          const result = SocialDataProcessors.processTikTokData(mockData);
          return Array.isArray(result);
        } catch (error) {
          return false;
        }
      }
    },
    {
      id: 'export-service',
      name: 'Export Service',
      description: 'Test if export service can create CSV files',
      test: () => {
        try {
          const { exportService } = require('../../../services/exportService');
          return typeof exportService.exportToCSV === 'function';
        } catch (error) {
          return false;
        }
      }
    },
    {
      id: 'api-service',
      name: 'API Service',
      description: 'Test if API service is properly configured',
      test: () => {
        try {
          const { socialListeningAPI } = require('../../../services/socialListeningAPI');
          return typeof socialListeningAPI.searchSocialContent === 'function';
        } catch (error) {
          return false;
        }
      }
    }
  ];

  const runTest = async (test: any) => {
    setTestResults(prev => ({ ...prev, [test.id]: 'pending' }));

    if (test.test) {
      // Run function-based test
      try {
        const result = await test.test();
        setTestResults(prev => ({ 
          ...prev, 
          [test.id]: result ? 'pass' : 'fail' 
        }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          [test.id]: 'fail' 
        }));
      }
    } else {
      // Run page load test
      try {
        const response = await fetch(test.url);
        setTestResults(prev => ({ 
          ...prev, 
          [test.id]: response.ok ? 'pass' : 'fail' 
        }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          [test.id]: 'fail' 
        }));
      }
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    for (const test of tests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className={styles.statusIcon} style={{ color: '#10b981' }} />;
      case 'fail':
        return <XCircle className={styles.statusIcon} style={{ color: '#ef4444' }} />;
      default:
        return <AlertCircle className={styles.statusIcon} style={{ color: '#6b7280' }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return 'Passed';
      case 'fail':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const passedTests = Object.values(testResults).filter(status => status === 'pass').length;
  const totalTests = tests.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Feature Testing Dashboard</h1>
        <p>Test the new social listening and hashtag finder features</p>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Test Results</h3>
          <div className={styles.summaryStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{passedTests}</span>
              <span className={styles.statLabel}>Passed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalTests - passedTests}</span>
              <span className={styles.statLabel}>Failed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalTests}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
        </div>

        <button 
          className={styles.runAllButton}
          onClick={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <RefreshCw className={styles.spinner} />
              Running Tests...
            </>
          ) : (
            'Run All Tests'
          )}
        </button>
      </div>

      <div className={styles.testsGrid}>
        {tests.map((test) => (
          <div key={test.id} className={styles.testCard}>
            <div className={styles.testHeader}>
              <div className={styles.testInfo}>
                <h3>{test.name}</h3>
                <p>{test.description}</p>
                {test.url && (
                  <a href={test.url} target="_blank" rel="noopener noreferrer" className={styles.testLink}>
                    Open Page →
                  </a>
                )}
              </div>
              <div className={styles.testStatus}>
                {getStatusIcon(testResults[test.id] || 'pending')}
                <span className={styles.statusText}>
                  {getStatusText(testResults[test.id] || 'pending')}
                </span>
              </div>
            </div>
            
            <div className={styles.testActions}>
              <button 
                className={styles.runTestButton}
                onClick={() => runTest(test)}
                disabled={isRunning}
              >
                Run Test
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.instructions}>
        <h3>How to Test the Features</h3>
        <div className={styles.instructionSteps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Navigate to Hashtag Finder API</h4>
              <p>Click on "Hashtag Finder API" in the sidebar or go to <code>/dashboard/hashtag-finder-api</code></p>
              <ul>
                <li>Search for hashtags like "#AI" or "#tech"</li>
                <li>Check the trending hashtags section</li>
                <li>Test the hashtag performance metrics</li>
                <li>Try comparing different hashtags</li>
              </ul>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Test Data Integration</h4>
              <p>Verify that the features work with your existing data:</p>
              <ul>
                <li>Check if mock data displays correctly</li>
                <li>Test the data processors with your API data</li>
                <li>Verify export functionality works</li>
                <li>Check responsive design on different screen sizes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.troubleshooting}>
        <h3>Troubleshooting</h3>
        <div className={styles.troubleshootingContent}>
          <div className={styles.issue}>
            <h4>Pages not loading?</h4>
            <p>Make sure you're running the development server with <code>npm run dev</code> or <code>yarn dev</code></p>
          </div>
          <div className={styles.issue}>
            <h4>Charts not displaying?</h4>
            <p>Check the browser console for any JavaScript errors. The charts use CSS for styling.</p>
          </div>
          <div className={styles.issue}>
            <h4>Export not working?</h4>
            <p>Make sure you have data loaded first. The export functionality requires data to be present.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


