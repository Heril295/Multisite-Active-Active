import React, { useState, useEffect } from 'react';

function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [latency, setLatency] = useState(0);
  
  // Heavy Task State
  const [loadingTask, setLoadingTask] = useState(false);
  const [taskResult, setTaskResult] = useState(null);
  
  // Traceroute State
  const [traceData, setTraceData] = useState(null);
  const [tracing, setTracing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch routing info and calculate RTT Latency
  const fetchInfo = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_URL}/api/info`);
      const data = await response.json();
      setServerInfo(data);
      setLatency(Date.now() - startTime);
    } catch (error) {
      console.error("Failed to fetch server info", error);
    }
  };

  // Poll every 3 seconds to watch traffic shifts
  useEffect(() => {
    fetchInfo();
    const interval = setInterval(fetchInfo, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerHeavyTask = async () => {
    setLoadingTask(true);
    setTaskResult(null);
    try {
      const response = await fetch(`${API_URL}/api/heavy-task`);
      const data = await response.json();
      setTaskResult(data);
    } catch (error) {
      console.error("Task failed", error);
    }
    setLoadingTask(false);
  };

  const runTraceroute = async () => {
    setTracing(true);
    setTraceData(null);
    try {
      const response = await fetch(`${API_URL}/api/trace`);
      const data = await response.json();
      setTraceData(data);
    } catch (error) {
      setTraceData({ traceOutput: "Error executing traceroute" });
    }
    setTracing(false);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Cloud Routing & Network Dashboard</h1>
      <p>Verify multi-site routing, monitor blue-green shifts, and test auto-scaling infrastructure.</p>
      
      {serverInfo ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Routing & Environment Card */}
          <div style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h2>Environment: <span style={{ color: serverInfo.version.includes('Blue') ? '#0056b3' : '#2e7d32' }}>{serverInfo.version}</span></h2>
            <p><strong>Serving Hostname:</strong> {serverInfo.hostname}</p>
            <p><strong>Server Internal IP:</strong> {serverInfo.serverIp}</p>
            <p><strong>Your Client IP:</strong> {serverInfo.clientIp}</p>
          </div>

          {/* Latency Telemetry Card */}
          <div style={{ background: '#eef2f5', padding: '20px', borderRadius: '8px', border: '1px solid #c2d1d9' }}>
            <h2>Network Latency</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: latency > 150 ? '#d9534f' : '#2e7d32' }}>
              {latency} ms
            </div>
            <p>Current Round-Trip Time (RTT)</p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
              Watch this metric drop when traffic routes to a geographically closer region in Active-Active mode.
            </p>
          </div>
        </div>
      ) : (
        <p>Connecting to backend API...</p>
      )}

      {/* Production Load Simulation */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Simulate Production Load</h3>
        <p style={{ color: '#555' }}>Trigger a synchronous CPU block to test load balancer scaling (e.g., Kubernetes HPA, AWS ASG).</p>
        <button 
          onClick={triggerHeavyTask} 
          disabled={loadingTask}
          style={{ padding: '10px 20px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loadingTask ? 'Processing...' : 'Trigger Heavy Task'}
        </button>
        
        {taskResult && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '4px', color: '#2e7d32' }}>
            Task processed by <strong>{taskResult.hostname}</strong> in <strong>{taskResult.durationMs}ms</strong>.
          </div>
        )}
      </div>

      {/* Traceroute Terminal */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #333', borderRadius: '8px', background: '#1e1e1e', color: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Packet Hop Diagnostics (Traceroute)</h3>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Execute an outbound trace from the backend container to verify cloud VPC boundaries and outbound routing paths.
        </p>
        
        <button 
          onClick={runTraceroute} 
          disabled={tracing}
          style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}
        >
          {tracing ? 'Tracing Route...' : 'Run Traceroute'}
        </button>
        
        {traceData && (
          <div style={{ background: '#000', padding: '15px', borderRadius: '4px', overflowX: 'auto', border: '1px solid #444' }}>
            <div style={{ color: '#4CAF50', marginBottom: '10px', fontFamily: 'monospace' }}>$ traceroute {traceData.target}</div>
            <pre style={{ margin: 0, color: '#e6e6e6', fontFamily: 'monospace', lineHeight: '1.4' }}>
              {traceData.traceOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;