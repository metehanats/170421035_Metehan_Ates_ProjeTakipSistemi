import React, { useState, useEffect, useCallback, useRef, useMemo, memo, lazy, Suspense } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDownward as ArrowDownIcon,
  AccountTree as WorkflowIcon,
  BugReport,
  Assignment,
  Timeline,
  Flag,
  AddLink as AddTransitionIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { workflowService, issueTypeService, issueStatusService } from '../../services/api';

const WorkflowsAdmin = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const LazyReactFlow = lazy(() => import('reactflow'));
  const [workflowFormData, setWorkflowFormData] = useState({
    name: '',
    description: '',
    fromStatus: '',
    toStatus: '',
    issueTypeIds: []
  });

  const [transitionFormData, setTransitionFormData] = useState({
    name: '',
    description: '',
    fromStatus: '',
    toStatus: '',
    issueTypeIds: []
  });

  // State variables for API data
  const [workflows, setWorkflows] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [workflowStatuses, setWorkflowStatuses] = useState([]);

  // Fetch all required data on component mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [workflowsRes, statusesRes, issueTypesRes] = await Promise.all([
        workflowService.getAll(),
        issueStatusService.getAll(),
        issueTypeService.getAll()
      ]);

      setWorkflows(workflowsRes.data);
      setStatuses(statusesRes.data);
      setIssueTypes(issueTypesRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  }, []);

  // Bileşeninizin en üstünde
  useEffect(() => {
    // ResizeObserver hatası için geçici çözüm
    const handleError = (event) => {
      if (event.message && event.message.includes('ResizeObserver')) {
        event.stopImmediatePropagation();
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedWorkflow) {
      const fetchWorkflowStatuses = async () => {
        try {
          const response = await issueStatusService.getAll();
          setWorkflowStatuses(response.data);
        } catch (err) {
          console.error("Error fetching workflow statuses:", err);
          setNotification({
            open: true,
            message: "Failed to load workflow statuses",
            severity: "error"
          });
        }
      };

      fetchWorkflowStatuses();
    }
  }, [selectedWorkflow]);

  // Group workflows by issue type for better display
  const groupedWorkflows = workflows.reduce((acc, workflow) => {
    // For each issue type in the workflow
    workflow.issueTypeIds.forEach(typeId => {
      if (!acc[typeId]) {
        acc[typeId] = [];
      }
      acc[typeId].push(workflow);
    });
    return acc;
  }, {});

  // Get unique workflows for the list view
  const uniqueWorkflowGroups = Object.entries(groupedWorkflows).map(([typeId, workflows]) => {
    // Find the issue type
    const issueType = issueTypes.find(t => t.typeId === parseInt(typeId));
    
    // Get all unique statuses in these workflows
    const allStatuses = workflows.reduce((acc, workflow) => {
      if (workflow.fromStatusNavigation) acc.add(workflow.fromStatusNavigation.statusId);
      if (workflow.toStatusNavigation) acc.add(workflow.toStatusNavigation.statusId);
      return acc;
    }, new Set());
    
    return {
      issueTypeId: parseInt(typeId),
      issueType,
      workflows,
      statusCount: allStatuses.size,
      transitionCount: workflows.length
    };
  });

  const getStatusById = (id) => statuses.find(s => s.statusId === id);
  const getIssueTypeById = (id) => issueTypes.find(t => t.typeId === id);

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setWorkflowFormData({
      name: '',
      description: '',
      fromStatus: '',
      toStatus: '',
      issueTypeIds: []
    });
    setWorkflowDialogOpen(true);
  };

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowFormData({
      name: workflow.name,
      description: workflow.description,
      fromStatus: workflow.fromStatus,
      toStatus: workflow.toStatus,
      issueTypeIds: workflow.issueTypeIds || []
    });
    setWorkflowDialogOpen(true);
  };

  const handleSaveWorkflow = async () => {
    try {
      if (editingWorkflow) {
        await workflowService.update(editingWorkflow.workflowId, {
          name: workflowFormData.name,
          description: workflowFormData.description,
          fromStatus: parseInt(workflowFormData.fromStatus),
          toStatus: parseInt(workflowFormData.toStatus),
          issueTypeIds: workflowFormData.issueTypeIds
        });
        
        setNotification({
          open: true,
          message: "Workflow updated successfully",
          severity: "success"
        });
      } else {
        await workflowService.create({
          name: workflowFormData.name,
          description: workflowFormData.description,
          fromStatus: parseInt(workflowFormData.fromStatus),
          toStatus: parseInt(workflowFormData.toStatus),
          issueTypeIds: workflowFormData.issueTypeIds
        });
        
        setNotification({
          open: true,
          message: "Workflow created successfully",
          severity: "success"
        });
      }
      
      // Refresh data
      await fetchData();
      setWorkflowDialogOpen(false);
    } catch (err) {
      console.error("Error saving workflow:", err);
      setNotification({
        open: true,
        message: "Error saving workflow: " + (err.response?.data || err.message),
        severity: "error"
      });
    }
  };

  const handleDeleteWorkflow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) {
      return;
    }
    
    try {
      await workflowService.delete(id);
      
      setNotification({
        open: true,
        message: "Workflow deleted successfully",
        severity: "success"
      });
      
      // Refresh data
      await fetchData();
      
      if (selectedWorkflow?.workflowId === id) {
        setSelectedWorkflow(null);
      }
    } catch (err) {
      console.error("Error deleting workflow:", err);
      setNotification({
        open: true,
        message: "Error deleting workflow: " + (err.response?.data || err.message),
        severity: "error"
      });
    }
  };

  const handleDeleteTransition = async (workflowId, fromStatusId, toStatusId) => {
    if (!window.confirm("Are you sure you want to delete this transition?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Yeni eklenen DeleteTransition endpoint'ini kullan
      await workflowService.deleteTransition(workflowId, fromStatusId, toStatusId);
      
      setNotification({
        open: true,
        message: "Transition successfully deleted",
        severity: "success"
      });
      
      // Workflow listesini yeniden yükle
      await fetchData();
      
      // Eğer seçili workflow varsa, ilgili workflow'u güncelle
      if (selectedWorkflow) {
        const updatedWorkflows = selectedWorkflow.workflows.filter(
          w => !(w.workflowId === workflowId && w.fromStatus === fromStatusId && w.toStatus === toStatusId)
        );
        
        setSelectedWorkflow({
          ...selectedWorkflow,
          workflows: updatedWorkflows
        });
      }
    } catch (err) {
      console.error("Error deleting transition:", err);
      setNotification({
        open: true,
        message: "Failed to delete transition: " + (err.message || "Unknown error"),
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransition = () => {
    setTransitionFormData({
      name: '',
      description: '',
      fromStatus: '',
      toStatus: '',
      issueTypeIds: []
    });
    setTransitionDialogOpen(true);
  };

  const handleSaveTransition = async () => {
    try {
      await workflowService.create({
        name: transitionFormData.name,
        description: transitionFormData.description,
        fromStatus: parseInt(transitionFormData.fromStatus),
        toStatus: parseInt(transitionFormData.toStatus),
        issueTypeIds: transitionFormData.issueTypeIds
      });
      
      setNotification({
        open: true,
        message: "Transition added successfully",
        severity: "success"
      });
      
      // Refresh data
      await fetchData();
      setTransitionDialogOpen(false);
    } catch (err) {
      console.error("Error saving transition:", err);
      setNotification({
        open: true,
        message: "Error adding transition: " + (err.response?.data || err.message),
        severity: "error"
      });
    }
  };

  const handleUpdateStatusOrder = async (workflowId, orderedStatuses) => {
    try {
      await workflowService.updateStatusOrder(workflowId, {
        workflowId,
        statuses: orderedStatuses.map((status, index) => ({
          statusId: status.statusId,
          order: index + 1
        }))
      });
      
      setNotification({
        open: true,
        message: "Status order updated successfully",
        severity: "success"
      });
      
      // Refresh workflow statuses
      if (selectedWorkflow?.workflowId === workflowId) {
        const response = await workflowService.getStatuses(workflowId);
        setWorkflowStatuses(response.data);
      }
    } catch (err) {
      console.error("Error updating status order:", err);
      setNotification({
        open: true,
        message: "Error updating status order: " + (err.response?.data || err.message),
        severity: "error"
      });
    }
  };

  const handleSelectWorkflowGroup = async (issueTypeId) => {
    try {
      // Seçilen issue type'ı ayarla
      setSelectedWorkflow({
        issueTypeId,
        issueType: getIssueTypeById(issueTypeId),
        workflows: groupedWorkflows[issueTypeId] || []
      });
      
      // Statüleri yükle
      const statusesResponse = await issueStatusService.getAll();
      setWorkflowStatuses(statusesResponse.data);
    } catch (err) {
      console.error("Error selecting workflow:", err);
      setNotification({
        open: true,
        message: "Error loading workflow details",
        severity: "error"
      });
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      BugReport: <BugReport />,
      Assignment: <Assignment />,
      Timeline: <Timeline />,
      Flag: <Flag />,
    };
    return icons[iconName] || <Assignment />;
  };

  // WorkflowDiagram bileşeninde yapılacak değişiklikler
  const WorkflowDiagram = ({ workflowGroup }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);
  
  // Lazy loading için kullanacağımız ref
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Görünürlüğü kontrol etmek için IntersectionObserver kullanımı
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Özel node bileşeni
  const StatusNode = ({ data }) => {
    return (
      <div
        style={{
          background: data.color,
          color: data.textColor,
          padding: '8px 12px', // Daha küçük padding
          borderRadius: '6px',
          width: '130px', // Daha küçük genişlik
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '13px', // Daha küçük font
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Daha hafif gölge
          fontFamily: 'inherit',
        }}
      >
        {data.label}
      </div>
    );
  };

  // Özel edge bileşeni
  const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data, style, markerEnd }) => {
    const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
    const [isHovered, setIsHovered] = useState(false);
    
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2 - 15;
    
    return (
      <g 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
          strokeDasharray={data.label.includes("Optional") ? "5,5" : "none"}
        />
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          style={{ 
            fontSize: 11, // Daha küçük font
            fill: '#666',
            fontFamily: 'inherit',
            pointerEvents: 'none'
          }}
        >
          {data.label}
        </text>
        
        {isHovered && (
          <g 
            transform={`translate(${midX + 50}, ${midY - 10})`}
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete();
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="8" cy="8" r="8" fill="#fff" stroke="#f44336" strokeWidth="1" />
            <line x1="5" y1="5" x2="11" y2="11" stroke="#f44336" strokeWidth="1.5" />
            <line x1="11" y1="5" x2="5" y2="11" stroke="#f44336" strokeWidth="1.5" />
          </g>
        )}
      </g>
    );
  };

  // Memoize edilmiş node ve edge tipleri
  const nodeTypes = useMemo(() => ({ 
    statusNode: StatusNode 
  }), []);
  
  const edgeTypes = useMemo(() => ({ 
    customEdge: CustomEdge 
  }), []);

  // Memoize edilmiş fitViewOptions
  const fitViewOptions = useMemo(() => ({ 
    padding: 0.2,
    includeHiddenNodes: false,
    minZoom: 0.5,
    maxZoom: 1.5
  }), []);

  useEffect(() => {
    if (!isVisible || !workflowGroup || !workflowStatuses.length || !workflowGroup.workflows.length) return;

    console.log("Creating nodes and edges");
    
    // Sadece bu workflow'da kullanılan statüleri belirle
    const usedStatusIds = new Set();
    workflowGroup.workflows.forEach(workflow => {
      if (workflow.fromStatus) usedStatusIds.add(workflow.fromStatus);
      if (workflow.toStatus) usedStatusIds.add(workflow.toStatus);
    });
    
    // Sadece kullanılan statüleri filtrele
    const filteredStatuses = workflowStatuses.filter(status => 
      usedStatusIds.has(status.statusId)
    );
    
    // Statüleri sırala (soldan sağa akış için)
    const sortedStatuses = [...filteredStatuses].sort((a, b) => {
      // Başlangıç statüleri (sadece fromStatus olarak kullanılanlar) en sola
      const aIsOnlyFrom = workflowGroup.workflows.some(w => w.fromStatus === a.statusId) && 
                        !workflowGroup.workflows.some(w => w.toStatus === a.statusId);
      
      const bIsOnlyFrom = workflowGroup.workflows.some(w => w.fromStatus === b.statusId) && 
                        !workflowGroup.workflows.some(w => w.toStatus === b.statusId);
      
      // Bitiş statüleri (sadece toStatus olarak kullanılanlar) en sağa
      const aIsOnlyTo = !workflowGroup.workflows.some(w => w.fromStatus === a.statusId) && 
                        workflowGroup.workflows.some(w => w.toStatus === a.statusId);
      
      const bIsOnlyTo = !workflowGroup.workflows.some(w => w.fromStatus === b.statusId) && 
                        workflowGroup.workflows.some(w => w.toStatus === b.statusId);
      
      if (aIsOnlyFrom && !bIsOnlyFrom) return -1;
      if (!aIsOnlyFrom && bIsOnlyFrom) return 1;
      if (aIsOnlyTo && !bIsOnlyTo) return 1;
      if (!aIsOnlyTo && bIsOnlyTo) return -1;
      
      return a.name.localeCompare(b.name);
    });

    console.log("Sorted statuses:", sortedStatuses);

    // Optimize edilmiş node'lar
    const newNodes = sortedStatuses.map((status, index) => ({
      id: status.statusId.toString(),
      type: 'statusNode',
      data: { 
        label: status.name,
        color: status.color || '#DDD',
        textColor: (status.color === '#6B7280' || status.color === '#DDD' || status.color === '#FFFFFF') ? '#000' : '#fff'
      },
      position: { x: 50 + (index * 200), y: 50 }, // Daha sıkışık düzen
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    console.log("Created nodes:", newNodes);

    // Optimize edilmiş edge'ler
    const newEdges = workflowGroup.workflows.map((workflow) => {
      console.log(`Creating edge from ${workflow.fromStatus} to ${workflow.toStatus}`);
      return {
        id: `e${workflow.workflowId}`,
        source: workflow.fromStatus.toString(),
        target: workflow.toStatus.toString(),
        type: 'default', // Önce default edge tipi ile deneyin
        label: workflow.name,
        labelStyle: { fill: '#666', fontSize: 11 },
        style: { stroke: '#666', strokeWidth: 1.5 },
        animated: workflow.name.includes("Optional"),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#666',
        },
      };
    });

    console.log("Created edges:", newEdges);

    // Batch update için setTimeout kullanımı
    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflowGroup, workflowStatuses, isVisible, handleDeleteTransition]);


  // Boş durum kontrolü
  if (!workflowGroup || !workflowStatuses.length || !workflowGroup.workflows.length) {
    return (
      <Box 
        sx={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#F9FAFB',
          borderRadius: 2,
          border: '1px solid #E5E7EB'
        }}
      >
        <Typography 
          sx={{ 
            color: '#9CA3AF',
            fontSize: '16px',
            mb: 2,
            fontFamily: 'inherit'
          }}
        >
          No transitions found for this workflow
        </Typography>
        <Button
          variant="text"
          startIcon={<AddTransitionIcon />}
          onClick={handleAddTransition}
          sx={{
            color: '#4F46E5',
            textTransform: 'none',
            fontFamily: 'inherit'
          }}
        >
          Add a transition to get started
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: 300,
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        backgroundColor: '#FCFCFC',
        overflow: 'hidden'
      }}
    >
      {isVisible ? (
        <Suspense fallback={
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            backgroundColor: '#FCFCFC' 
          }}>
            <CircularProgress size={24} sx={{ color: '#4F46E5' }} />
          </Box>
        }>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={fitViewOptions}
            minZoom={0.5}
            maxZoom={2}
            onInit={setRfInstance}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Controls 
              position="bottom-right" 
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <Background 
              color="#f0f0f0" 
              gap={16} 
              variant="dots" 
              size={1}
            />
          </ReactFlow>
        </Suspense>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          backgroundColor: '#FCFCFC' 
        }}>
          <CircularProgress size={24} sx={{ color: '#4F46E5' }} />
        </Box>
      )}
    </Box>
  );
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      p: 3,
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              fontSize: '28px',
              color: '#1a1a1a',
              mb: 1,
              fontFamily: 'inherit'
            }}
          >
            Workflows
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666666',
              fontSize: '16px',
              fontWeight: 400,
              fontFamily: 'inherit'
            }}
          >
            Configure status transitions and workflow diagrams for different issue types
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{
              mr: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              borderColor: '#D1D5DB',
              color: '#374151',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#F9FAFB'
              },
              fontFamily: 'inherit'
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateWorkflow}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontFamily: 'inherit'
            }}
          >
            Create Workflow
          </Button>
        </Box>
      </Box>

      {/* Workflow List - Yatay düzende */}
      <Card sx={{ 
        border: '1px solid #E5E7EB',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '18px',
                color: '#1a1a1a',
                fontFamily: 'inherit'
              }}
            >
              Workflows by Issue Type
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkflow}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                borderColor: '#D1D5DB',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB'
                },
                fontFamily: 'inherit'
              }}
            >
              Create Workflow
            </Button>
          </Box>
          
          {uniqueWorkflowGroups.length > 0 ? (
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
              {uniqueWorkflowGroups.map((group) => (
                <Card 
                  key={group.issueTypeId}
                  onClick={() => handleSelectWorkflowGroup(group.issueTypeId)}
                  sx={{
                    minWidth: 220,
                    maxWidth: 220,
                    border: selectedWorkflow?.issueTypeId === group.issueTypeId 
                      ? '2px solid #4F46E5' 
                      : '1px solid #E5E7EB',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: selectedWorkflow?.issueTypeId === group.issueTypeId 
                        ? '#4F46E5' 
                        : '#9CA3AF'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1.5}>
                                            <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: `${group.issueType?.color}20` || '#4F46E520',
                          color: group.issueType?.color || '#4F46E5',
                          mr: 1.5
                        }}
                      >
                        <WorkflowIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#1a1a1a',
                          fontFamily: 'inherit'
                        }}
                      >
                        {group.issueType?.name || 'Unknown Type'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          color: '#666666',
                          fontFamily: 'inherit',
                        }}
                      >
                        {group.statusCount} statuses
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          color: '#666666',
                          fontFamily: 'inherit',
                        }}
                      >
                        {group.transitionCount} transitions
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={group.issueType?.name}
                        size="small"
                        sx={{
                          backgroundColor: `${group.issueType?.color}15` || '#4F46E515',
                          color: group.issueType?.color || '#4F46E5',
                          fontSize: '10px',
                          height: 20,
                          fontFamily: 'inherit'
                        }}
                      />
                      
                      <Box>
                        <Tooltip title="Edit Workflow">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectWorkflowGroup(group.issueTypeId);
                            }}
                            sx={{
                              color: '#6B7280',
                              '&:hover': {
                                backgroundColor: '#F3F4F6',
                                color: '#374151'
                              },
                              p: 0.5
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Workflow">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Burada workflow ID'sini kullanarak silme işlemi yapılmalı
                              if (group.workflows.length > 0) {
                                handleDeleteWorkflow(group.workflows[0].workflowId);
                              }
                            }}
                            sx={{
                              color: '#6B7280',
                              '&:hover': {
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626'
                              },
                              p: 0.5
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography 
                sx={{ 
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  mb: 2
                }}
              >
                No workflows found
              </Typography>
              <Button
                variant="text"
                startIcon={<AddIcon />}
                onClick={handleCreateWorkflow}
                sx={{
                  color: '#4F46E5',
                  textTransform: 'none',
                  fontFamily: 'inherit'
                }}
              >
                Create your first workflow
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Workflow Diagram ve Detaylar */}
      {selectedWorkflow ? (
        <Card sx={{ 
          border: '1px solid #E5E7EB',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#1a1a1a',
                    fontFamily: 'inherit',
                    mb: 1
                  }}
                >
                  {selectedWorkflow.issueType?.name || 'Unknown Type'} Workflow
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '14px',
                    color: '#666666',
                    fontFamily: 'inherit'
                  }}
                >
                  {selectedWorkflow.workflows?.length || 0} transitions
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddTransitionIcon />}
                onClick={handleAddTransition}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    backgroundColor: '#F9FAFB'
                  },
                  fontFamily: 'inherit'
                }}
              >
                Add Transition
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3} direction="column">
              {/* Workflow Diagram - Yatay akış (Tam genişlik) */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontFamily: 'inherit',
                      mb: 2
                    }}
                  >
                    Workflow Diagram
                  </Typography>
                  
                  {selectedWorkflow.workflows && selectedWorkflow.workflows.length > 0 ? (
                    <WorkflowDiagram workflowGroup={selectedWorkflow} />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 300, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backgroundColor: '#F9FAFB',
                        borderRadius: 2
                      }}
                    >
                      <Typography 
                        sx={{ 
                          color: '#9CA3AF',
                          fontSize: '16px',
                          mb: 2,
                          fontFamily: 'inherit'
                        }}
                      >
                        No transitions found for this workflow
                      </Typography>
                      <Button
                        variant="text"
                        startIcon={<AddTransitionIcon />}
                        onClick={handleAddTransition}
                        sx={{
                          color: '#4F46E5',
                          textTransform: 'none',
                          fontFamily: 'inherit'
                        }}
                      >
                        Add a transition to get started
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Transitions Table */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontFamily: 'inherit'
                      }}
                    >
                      Transitions
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddTransitionIcon />}
                      onClick={handleAddTransition}
                      sx={{
                        textTransform: 'none',
                        fontSize: '12px',
                        color: '#4F46E5',
                        fontFamily: 'inherit'
                      }}
                    >
                      Add Transition
                    </Button>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                            Transition
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                            From Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                            To Status
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a', fontFamily: 'inherit' }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedWorkflow.workflows && selectedWorkflow.workflows.length > 0 ? (
                          selectedWorkflow.workflows.map((workflow) => (
                            <TableRow key={workflow.workflowId} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                              <TableCell>
                                <Box>
                                  <Typography 
                                    sx={{ 
                                      fontWeight: 500,
                                      fontSize: '14px',
                                      color: '#1a1a1a',
                                      fontFamily: 'inherit'
                                    }}
                                  >
                                    {workflow.name}
                                  </Typography>
                                  <Typography 
                                    sx={{ 
                                      fontSize: '12px',
                                      color: '#666666',
                                      fontFamily: 'inherit'
                                    }}
                                  >
                                    {workflow.description}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={workflow.fromStatusNavigation?.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: workflow.fromStatusNavigation?.color || '#DDD',
                                    color: (workflow.fromStatusNavigation?.color === '#6B7280' || workflow.fromStatusNavigation?.color === '#DDD' || workflow.fromStatusNavigation?.color === '#FFFFFF') ? '#000' : '#fff',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={workflow.toStatusNavigation?.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: workflow.toStatusNavigation?.color || '#DDD',
                                    color: (workflow.toStatusNavigation?.color === '#6B7280' || workflow.toStatusNavigation?.color === '#DDD' || workflow.toStatusNavigation?.color === '#FFFFFF') ? '#000' : '#fff',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit transition">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditWorkflow(workflow)}
                                    sx={{
                                      color: '#6B7280',
                                      '&:hover': {
                                        backgroundColor: '#F3F4F6',
                                        color: '#374151'
                                      }
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete transition">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTransition(workflow.workflowId, workflow.fromStatus, workflow.toStatus)}
                                    sx={{
                                      color: '#6B7280',
                                      '&:hover': {
                                        backgroundColor: '#FEF2F2',
                                        color: '#DC2626'
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                              <Typography sx={{ color: '#9CA3AF', fontSize: '14px', fontFamily: 'inherit' }}>
                                No transitions found
                              </Typography>
                              <Button
                                variant="text"
                                startIcon={<AddTransitionIcon />}
                                onClick={handleAddTransition}
                                sx={{
                                  mt: 1,
                                  color: '#4F46E5',
                                  textTransform: 'none',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Add a transition
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ 
          border: '1px solid #E5E7EB',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box textAlign="center">
            <WorkflowIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#9CA3AF',
                fontFamily: 'inherit',
                mb: 1
              }}
            >
              Select a Workflow
            </Typography>
            <Typography 
              sx={{ 
                color: '#6B7280',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              Choose a workflow from the list to view its diagram
            </Typography>
          </Box>
        </Card>
      )}

      {/* Create/Edit Workflow Dialog */}
      <Dialog 
        open={workflowDialogOpen} 
        onClose={() => setWorkflowDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          fontSize: '18px',
          color: '#1a1a1a',
          fontFamily: 'inherit'
        }}>
          {editingWorkflow ? 'Edit Workflow Transition' : 'Create Workflow Transition'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Transition Name"
              value={workflowFormData.name}
              onChange={(e) => setWorkflowFormData({ ...workflowFormData, name: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={workflowFormData.description}
              onChange={(e) => setWorkflowFormData({ ...workflowFormData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                From Status
              </InputLabel>
              <Select
                value={workflowFormData.fromStatus}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, fromStatus: e.target.value })}
                label="From Status"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.statusId} value={status.statusId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#DDD',
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {status.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                To Status
              </InputLabel>
              <Select
                value={workflowFormData.toStatus}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, toStatus: e.target.value })}
                label="To Status"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.statusId} value={status.statusId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#DDD',
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {status.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                Issue Types
              </InputLabel>
              <Select
                multiple
                value={workflowFormData.issueTypeIds}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, issueTypeIds: e.target.value })}
                label="Issue Types"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {issueTypes.map((type) => (
                  <MenuItem key={type.typeId} value={type.typeId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ color: type.color || '#3B82F6' }}>
                        {type.icon ? getIcon(type.icon) : <Assignment />}
                      </Box>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {type.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Transition Preview */}
            {workflowFormData.fromStatus && workflowFormData.toStatus && (
              <Box sx={{ mt: 3, p: 3, backgroundColor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontFamily: 'inherit'
                  }}
                >
                  Transition Preview
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={getStatusById(parseInt(workflowFormData.fromStatus))?.name}
                    size="small"
                    sx={{
                      backgroundColor: getStatusById(parseInt(workflowFormData.fromStatus))?.color || '#DDD',
                      color: (getStatusById(parseInt(workflowFormData.fromStatus))?.color === '#6B7280' || 
                             getStatusById(parseInt(workflowFormData.fromStatus))?.color === '#DDD' ||
                             getStatusById(parseInt(workflowFormData.fromStatus))?.color === '#FFFFFF') ? '#000' : '#fff',
                      fontFamily: 'inherit'
                    }}
                  />
                  <ArrowDownIcon sx={{ color: '#666666' }} />
                  <Chip
                    label={getStatusById(parseInt(workflowFormData.toStatus))?.name}
                    size="small"
                    sx={{
                      backgroundColor: getStatusById(parseInt(workflowFormData.toStatus))?.color || '#DDD',
                      color: (getStatusById(parseInt(workflowFormData.toStatus))?.color === '#6B7280' || 
                             getStatusById(parseInt(workflowFormData.toStatus))?.color === '#DDD' ||
                             getStatusById(parseInt(workflowFormData.toStatus))?.color === '#FFFFFF') ? '#000' : '#fff',
                      fontFamily: 'inherit'
                    }}
                  />
                </Box>
                {workflowFormData.name && (
                  <Typography 
                    sx={{ 
                      mt: 1,
                      fontSize: '12px',
                      color: '#666666',
                      fontFamily: 'inherit'
                    }}
                  >
                    "{workflowFormData.name}"
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setWorkflowDialogOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#666666',
              fontFamily: 'inherit'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveWorkflow} 
            variant="contained"
            disabled={!workflowFormData.fromStatus || !workflowFormData.toStatus || !workflowFormData.name || workflowFormData.issueTypeIds.length === 0}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              px: 3,
              fontFamily: 'inherit'
            }}
          >
            {editingWorkflow ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transition Dialog */}
      <Dialog 
        open={transitionDialogOpen} 
        onClose={() => setTransitionDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          fontSize: '18px',
          color: '#1a1a1a',
          fontFamily: 'inherit'
        }}>
          Add Transition
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Transition Name"
              value={transitionFormData.name}
              onChange={(e) => setTransitionFormData({ ...transitionFormData, name: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={transitionFormData.description}
              onChange={(e) => setTransitionFormData({ ...transitionFormData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                From Status
              </InputLabel>
              <Select
                value={transitionFormData.fromStatus}
                onChange={(e) => setTransitionFormData({ ...transitionFormData, fromStatus: e.target.value })}
                label="From Status"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.statusId} value={status.statusId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#DDD',
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {status.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                To Status
              </InputLabel>
              <Select
                value={transitionFormData.toStatus}
                onChange={(e) => setTransitionFormData({ ...transitionFormData, toStatus: e.target.value })}
                label="To Status"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.statusId} value={status.statusId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#DDD',
                        }}
                      />
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {status.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                Issue Types
              </InputLabel>
              <Select
                multiple
                value={transitionFormData.issueTypeIds}
                onChange={(e) => setTransitionFormData({ ...transitionFormData, issueTypeIds: e.target.value })}
                label="Issue Types"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }
                }}
              >
                {issueTypes.map((type) => (
                  <MenuItem key={type.typeId} value={type.typeId}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ color: type.color || '#3B82F6' }}>
                        {type.icon ? getIcon(type.icon) : <Assignment />}
                      </Box>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'inherit' }}>
                        {type.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Transition Preview */}
            {transitionFormData.fromStatus && transitionFormData.toStatus && (
              <Box sx={{ mt: 3, p: 3, backgroundColor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontFamily: 'inherit'
                  }}
                >
                  Transition Preview
                </Typography>
                                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={getStatusById(parseInt(transitionFormData.fromStatus))?.name}
                    size="small"
                    sx={{
                      backgroundColor: getStatusById(parseInt(transitionFormData.fromStatus))?.color || '#DDD',
                      color: (getStatusById(parseInt(transitionFormData.fromStatus))?.color === '#6B7280' || 
                             getStatusById(parseInt(transitionFormData.fromStatus))?.color === '#DDD' ||
                             getStatusById(parseInt(transitionFormData.fromStatus))?.color === '#FFFFFF') ? '#000' : '#fff',
                      fontFamily: 'inherit'
                    }}
                  />
                  <ArrowDownIcon sx={{ color: '#666666' }} />
                  <Chip
                    label={getStatusById(parseInt(transitionFormData.toStatus))?.name}
                    size="small"
                    sx={{
                      backgroundColor: getStatusById(parseInt(transitionFormData.toStatus))?.color || '#DDD',
                      color: (getStatusById(parseInt(transitionFormData.toStatus))?.color === '#6B7280' || 
                             getStatusById(parseInt(transitionFormData.toStatus))?.color === '#DDD' ||
                             getStatusById(parseInt(transitionFormData.toStatus))?.color === '#FFFFFF') ? '#000' : '#fff',
                      fontFamily: 'inherit'
                    }}
                  />
                </Box>
                {transitionFormData.name && (
                  <Typography 
                    sx={{ 
                      mt: 1,
                      fontSize: '12px',
                      color: '#666666',
                      fontFamily: 'inherit'
                    }}
                  >
                    "{transitionFormData.name}"
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setTransitionDialogOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: '#666666',
              fontFamily: 'inherit'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTransition} 
            variant="contained"
            disabled={!transitionFormData.fromStatus || !transitionFormData.toStatus || !transitionFormData.name || transitionFormData.issueTypeIds.length === 0}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              px: 3,
              fontFamily: 'inherit'
            }}
          >
            Add Transition
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowsAdmin;
