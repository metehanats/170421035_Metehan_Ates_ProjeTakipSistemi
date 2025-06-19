// src/pages/Board.js - TAM KOD
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  issueService, 
  userService, 
  issueTypeService, 
  workflowService, 
  issueStatusService,
  customFieldService,
  projectService
} from '../services/api';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Divider,
  CircularProgress,
  FormHelperText,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
  NewReleases as StoryIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DndContext, useDroppable, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProject } from '../context/ProjectContext';

// Droppable bileşeni - kolonlar için
const Droppable = ({ children, id, data }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: data
  });

  return (
    <div 
      ref={setNodeRef}
      data-droppable-id={id}
      data-status-id={data?.statusId}
      style={{
        minHeight: '200px',
        width: '100%',
        backgroundColor: isOver ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
        border: isOver ? '2px dashed #4F46E5' : '2px dashed transparent',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </div>
  );
};

const Board = () => {
  const { issueTypeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects } = useProject();
  
  // URL'den projectId'yi al
  const projectId = searchParams.get('projectId');

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [issueType, setIssueType] = useState(null);
  const [project, setProject] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [issueTypeCustomFields, setIssueTypeCustomFields] = useState([]);
  const [priorities, setPriorities] = useState([
    { id: 1, name: 'Low', color: '#36B37E' },
    { id: 2, name: 'Medium', color: '#FFA500' },
    { id: 3, name: 'High', color: '#FF5630' },
    { id: 4, name: 'Critical', color: '#DE350B' }
  ]);

  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [notification, setNotification] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [workflowTransitions, setWorkflowTransitions] = useState([]);
  
  // Issue oluşturma/düzenleme için gerekli state'ler
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeId: issueTypeId,
    statusId: '',
    priorityId: 1,
    projectId: '',
    assigneeId: '',
    reporterId: 1,
    dueDate: null,
    storyPoints: null,
    customFieldValues: {}
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // CSS stilleri için style etiketi ekleyin
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      [data-droppable-id] {
        transition: all 0.3s ease;
        min-height: 200px;
      }

      .valid-drop-target {
        background-color: rgba(16, 185, 129, 0.2) !important;
        border: 2px dashed #10B981 !important;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.3) !important;
      }

      .invalid-drop-target {
        opacity: 0.5;
        background-color: rgba(239, 68, 68, 0.05) !important;
        pointer-events: none;
      }

      .current-drop-target {
        background-color: rgba(59, 130, 246, 0.1) !important;
        border: 2px dashed #3B82F6 !important;
      }

      .is-dragging {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23) !important;
        transform: scale(1.02) !important;
      }

      .dnd-over {
        background-color: rgba(0, 82, 204, 0.1) !important;
        border: 2px dashed #0052CC !important;
      }

      .issue-card {
        transition: all 0.2s ease;
      }

      .issue-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // DnD için sensörler
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Proje bilgisini getir
  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      const response = await projectService.getById(projectId);
      setProject(response);
    } catch (error) {
      console.error("Proje bilgisi alınırken hata:", error);
    }
  };

  // Issue Type bilgisini ve custom field'ları getir
  const fetchIssueType = async () => {
    try {
      const [typeResponse, customFieldsResponse] = await Promise.all([
        issueTypeService.getById(issueTypeId),
        customFieldService.getAll()
      ]);
      
      if (typeResponse.data) {
        setIssueType(typeResponse.data);
      }
      
      if (customFieldsResponse.data) {
        setCustomFields(customFieldsResponse.data);
      }
      
      // Issue type'a özel custom field'ları getir
      try {
        const typeCustomFieldsResponse = await issueTypeService.getCustomFields(issueTypeId);
        if (typeCustomFieldsResponse.data) {
          setIssueTypeCustomFields(typeCustomFieldsResponse.data);
        }
      } catch (error) {
        console.warn("Issue type custom fields alınamadı:", error);
        setIssueTypeCustomFields([]);
      }
    } catch (error) {
      console.error("Issue type bilgisi alınırken hata:", error);
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    if (issueTypeId) {
      fetchData();
      fetchWorkflow();
      fetchIssueType();
      fetchProject();
    }
  }, [issueTypeId, projectId]);

  useEffect(() => {
    if (workflowTransitions.length > 0) {
      console.log("Workflow geçişleri:", workflowTransitions);
    }
  }, [workflowTransitions]);

  // Form verilerini sıfırla
  useEffect(() => {
    if (statuses.length > 0) {
      setFormData(prev => ({
        ...prev,
        typeId: parseInt(issueTypeId),
        statusId: statuses[0].statusId,
        projectId: projectId || (projects.length > 0 ? projects[0].id : '')
      }));
    }
  }, [statuses, projects, issueTypeId, projectId]);

  // Workflow verilerini API'den çekme
  const fetchWorkflow = async () => {
    try {
      const response = await workflowService.getByIssueType(issueTypeId);
      console.log("Workflow API yanıtı:", JSON.stringify(response.data));
      
      if (!response.data || response.data.length === 0) {
        console.warn(`Issue tipi ${issueTypeId} için workflow tanımlanmamış`);
        setWorkflowTransitions([]);
        return;
      }
      
      const transitions = response.data.map(item => ({
        workflowId: Number(item.workflowId),
        name: item.name,
        fromStatus: Number(item.fromStatus),
        toStatus: Number(item.toStatus),
        fromStatusName: item.fromStatusNavigation?.name || `Status ${item.fromStatus}`,
        toStatusName: item.toStatusNavigation?.name || `Status ${item.toStatus}`
      }));
      
      console.log("İşlenmiş workflow geçişleri:", transitions);
      setWorkflowTransitions(transitions);
      
    } catch (error) {
      console.error("Workflow verileri yüklenirken hata:", error);
      setWorkflowTransitions([]);
    }
  };

  // Issue verilerini API'den çekme
  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesResponse, usersResponse, statusesResponse] = await Promise.all([
        issueService.getAll(),
        userService.getAll(),
        issueStatusService.getAll() 
      ]);
      
      console.log("API'den gelen ham issue verileri:", issuesResponse.data);
      console.log("Project ID filtresi:", projectId);
      
      // Issue verilerini işle ve custom field değerlerini parse et
      const mappedIssues = issuesResponse.data.map(issue => {
        console.log("İşlenen issue:", issue);
        
        // Custom field değerlerini parse et
        let customFieldValues = {};
        if (issue.customFieldValues) {
          try {
            if (typeof issue.customFieldValues === 'string') {
              customFieldValues = JSON.parse(issue.customFieldValues);
            } else if (typeof issue.customFieldValues === 'object') {
              customFieldValues = issue.customFieldValues;
            }
          } catch (e) {
            console.warn("Custom field values parse edilemedi:", e);
            customFieldValues = {};
          }
        }
        
        return {
          ...issue,
          id: issue.issueId || issue.id,
          typeId: parseInt(issue.typeId || issueTypeId),
          statusId: parseInt(issue.statusId || issue.status || 0),
          projectId: parseInt(issue.projectId || 0),
          customFieldValues: customFieldValues
        };
      });
      
      // İlk olarak issue type'a göre filtrele
      let filteredIssues = mappedIssues.filter(issue => {
        const issueTypeMatch = parseInt(issue.typeId) === parseInt(issueTypeId);
        console.log(`Issue ${issue.id}: typeId=${issue.typeId}, target=${issueTypeId}, match=${issueTypeMatch}`);
        return issueTypeMatch;
      });
      
      console.log("Type'a göre filtrelenmiş issue'lar:", filteredIssues);
      
      // Eğer projectId varsa, o projeye ait issue'ları da filtrele
      if (projectId && projectId !== 'null' && projectId !== 'undefined') {
        const projectIdInt = parseInt(projectId);
        filteredIssues = filteredIssues.filter(issue => {
          const projectMatch = parseInt(issue.projectId) === projectIdInt;
          console.log(`Issue ${issue.id}: projectId=${issue.projectId}, target=${projectIdInt}, match=${projectMatch}`);
          return projectMatch;
        });
        console.log(`Proje ${projectId}'ye göre filtrelenmiş issue'lar:`, filteredIssues);
      } else {
        console.log("ProjectId yok, tüm issue'lar gösteriliyor");
      }
      
      setIssues(filteredIssues);
      setUsers(usersResponse.data);
      
      if (statusesResponse.data && statusesResponse.data.length > 0) {
        console.log("Statüsler yüklendi:", statusesResponse.data);
        setStatuses(statusesResponse.data);
      } else {
        console.warn("Statüs verisi boş veya eksik");
      }
      
      setError(null);
    } catch (err) {
      console.error('Veri yüklenirken hata oluştu:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Breadcrumbs render fonksiyonu
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={() => navigate('/projects')}
          sx={{ cursor: 'pointer' }}
        >
          Projects
        </Link>
        {project && projectId && (
          <>
            <Link 
              underline="hover" 
              color="inherit" 
              onClick={() => navigate(`/project/${projectId}`)}
              sx={{ cursor: 'pointer' }}
            >
              {project.name}
            </Link>
            <Link 
              underline="hover" 
              color="inherit" 
              onClick={() => navigate(`/project/${projectId}/boards`)}
              sx={{ cursor: 'pointer' }}
            >
              Boards
            </Link>
          </>
        )}
        <Typography color="text.primary" fontWeight="500">
          {issueType?.name} Board
        </Typography>
      </Breadcrumbs>
    );
  };

  // Form alanları değiştiğinde
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customField_')) {
      const fieldId = name.replace('customField_', '');
      setFormData({
        ...formData,
        customFieldValues: {
          ...formData.customFieldValues,
          [fieldId]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };

  // Dialog açma işlevi
  const handleOpenDialog = (issue = null) => {
    if (issue) {
      setEditingIssue(issue);
      setFormData({
        title: issue.title,
        description: issue.description || '',
        typeId: parseInt(issueTypeId),
        statusId: parseInt(issue.statusId) || (statuses.length > 0 ? statuses[0].statusId : ''),
        priorityId: parseInt(issue.priorityId) || 1,
        projectId: issue.projectId,
        assigneeId: issue.assigneeId || '',
        reporterId: issue.reporterId || 1,
        dueDate: issue.dueDate || null,
        storyPoints: issue.storyPoints || null,
        customFieldValues: issue.customFieldValues || {}
      });
    } else {
      setEditingIssue(null);
      setFormData({
        title: '',
        description: '',
        typeId: parseInt(issueTypeId),
        statusId: statuses.length > 0 ? statuses[0].statusId : '',
        priorityId: 1,
        projectId: projectId || (projects.length > 0 ? projects[0].id : ''),
        assigneeId: '',
        reporterId: 1,
        dueDate: null,
        storyPoints: null,
        customFieldValues: {}
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  // Dialog kapatma işlevi
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIssue(null);
    setFormErrors({});
  };

  // Context menu açma işlevi
  const handleOpenMenu = (event, issue) => {
    setAnchorEl(event.currentTarget);
    setSelectedIssue(issue);
  };

  // Context menu kapatma işlevi
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedIssue(null);
  };

  // Issue kaydetme işlevi
  const handleSaveIssue = async () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Başlık gerekli";
    if (!formData.typeId) errors.typeId = "Tür seçimi gerekli";
    if (!formData.statusId) errors.statusId = "Durum seçimi gerekli";
    if (!formData.projectId) errors.projectId = "Proje seçimi gerekli";
    
    // Custom field validasyonu
    issueTypeCustomFields.forEach(cf => {
      const customField = customFields.find(f => f.fieldId === cf.customFieldId);
      if (customField && cf.isRequired && !formData.customFieldValues[cf.customFieldId]) {
        errors[`customField_${cf.customFieldId}`] = `${customField.fieldName} gerekli`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      // Custom field değerlerini JSON string'e çevir
      const customFieldValuesJson = JSON.stringify(formData.customFieldValues);
      
      const apiData = {
        projectId: parseInt(formData.projectId),
        title: formData.title,
        description: formData.description || "",
        typeId: parseInt(formData.typeId),
        statusId: parseInt(formData.statusId),
        priorityId: parseInt(formData.priorityId),
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        reporterId: parseInt(formData.reporterId),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        parentIssueId: null,
        storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : null,
        customFieldValues: customFieldValuesJson
      };
      
      console.log("API'ye gönderilen veri:", apiData);
      
      if (editingIssue) {
        await issueService.update(editingIssue.id, apiData);
        
        setIssues(issues.map(i => 
          i.id === editingIssue.id 
            ? { ...i, ...formData, id: editingIssue.id, updatedAt: new Date().toISOString() }
            : i
        ));
        
        setNotification({
          type: 'success',
          message: 'Issue başarıyla güncellendi'
        });
      } else {
        const response = await issueService.create(apiData);
        
        const newIssue = {
          ...formData,
          id: response.data.issueId || response.data.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setIssues([...issues, newIssue]);
        
        setNotification({
          type: 'success',
          message: 'Yeni issue başarıyla oluşturuldu'
        });
      }
      handleCloseDialog();
      
      // Verileri yeniden yükle
      fetchData();
    } catch (err) {
      console.error('Issue kaydedilirken hata oluştu:', err);
      if (err.response) {
        console.error('API yanıtı:', err.response.data);
      }
      
      setNotification({
        type: 'error',
        message: 'Issue kaydedilirken bir hata oluştu: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Issue silme işlevi
  const handleDeleteIssue = async (issueId) => {
    if (!issueId) return;
    
    if (!window.confirm('Bu issue\'yu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await issueService.delete(issueId);
      setIssues(issues.filter(i => i.id !== issueId));
      handleCloseMenu();
      setNotification({
        type: 'success',
        message: 'Issue başarıyla silindi'
      });
    } catch (err) {
      console.error('Issue silinirken hata oluştu:', err);
      setNotification({
        type: 'error',
        message: 'Issue silinirken bir hata oluştu'
      });
    }
  };

  // DnD sürükleme başladığında
  const handleDragStart = (event) => {
    const { active } = event;
    
    setActiveId(active.id);
    
    console.log("Sürükleme başladı:", active);
    
    const sourceStatusId = active.data.current.statusId;
    console.log("Kaynak status ID:", sourceStatusId);
    
    const validTargetStatuses = workflowTransitions
      .filter(transition => transition.fromStatus === parseInt(sourceStatusId))
      .map(transition => transition.toStatus);
    
    console.log("Geçerli hedef statuslar:", validTargetStatuses);
    
    document.querySelectorAll('[data-droppable-id]').forEach(el => {
      const statusId = parseInt(el.getAttribute('data-status-id'));
      
      if (statusId === parseInt(sourceStatusId)) {
        el.classList.add('current-drop-target');
        return;
      }
      
      if (validTargetStatuses.includes(statusId)) {
        el.classList.add('valid-drop-target');
      } else {
        el.classList.add('invalid-drop-target');
      }
    });
    
    const draggedCard = document.querySelector(`[data-issue-id="${active.id}"]`);
    if (draggedCard) {
      draggedCard.classList.add('is-dragging');
    }
  };

  // DnD sürükleme üzerinde
  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const currentOverElement = document.querySelector('.dnd-over');
    
    let targetId;
    if (typeof over.id === 'string' && over.id.startsWith('droppable-')) {
      targetId = over.id;
    } else if (over.id && typeof over.id === 'object' && over.id.toString) {
      const idStr = over.id.toString();
      targetId = idStr.startsWith('droppable-') ? idStr : null;
    }
    
    if (!targetId) return;
    
    if (currentOverElement && currentOverElement.id !== targetId) {
      currentOverElement.classList.remove('dnd-over');
    }
    
    const targetElement = document.getElementById(targetId);
    if (targetElement && !targetElement.classList.contains('dnd-over')) {
      targetElement.classList.add('dnd-over');
    }
  };

  // DnD sürükleme bittiğinde
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    console.log("Sürükleme bitti:", { active, over });
    
    // Tüm vurgulamaları temizle
    document.querySelectorAll('[data-droppable-id]').forEach(el => {
      el.classList.remove('valid-drop-target', 'invalid-drop-target', 'current-drop-target', 'dnd-over');
    });
    
    // Sürüklenen kart vurgusunu kaldır
    const draggedCard = document.querySelector('.is-dragging');
    if (draggedCard) {
      draggedCard.classList.remove('is-dragging');
    }
    
    // Aktif ID'yi temizle
    setActiveId(null);
    
    // Eğer hedef yoksa işlemi iptal et
    if (!over) {
      console.log("Hedef bulunamadı, sürükleme iptal edildi");
      return;
    }
    
    // Sürüklenen issue ID'sini al
    const issueId = String(active.id);
    
    // Kaynak status ID'sini al
    const sourceStatusId = parseInt(active.data.current.statusId);
    
    // Hedef durum ID'sini belirleme
    let targetStatusId;
    
    console.log("Over ID:", over.id);
    console.log("Over data:", over.data?.current);
    
    // 1. Droppable alan kontrolü (öncelik)
    if (over.data?.current?.statusId) {
      targetStatusId = parseInt(over.data.current.statusId);
      console.log("Droppable alan tespit edildi, target status:", targetStatusId);
    } 
    // 2. Droppable ID string kontrolü
    else if (typeof over.id === 'string' && over.id.startsWith('droppable-')) {
      targetStatusId = parseInt(over.id.replace('droppable-', ''));
      console.log("Droppable ID'den tespit edildi, target status:", targetStatusId);
    } 
    // 3. Issue üzerine bırakma kontrolü
    else {
      const overIssue = issues.find(i => String(i.id) === String(over.id));
      if (overIssue) {
        targetStatusId = parseInt(overIssue.statusId);
        console.log("Issue üzerine bırakıldı, hedef issue'nun status ID'si:", targetStatusId);
      } else {
        console.warn("Hedef tespit edilemedi, sürükleme iptal edildi");
        return;
      }
    }
    
    console.log("Target Status ID:", targetStatusId);
    console.log(`Tespit edilen geçiş: ${sourceStatusId} -> ${targetStatusId}`);
    
    // Aynı statusa bırakıldıysa işlemi iptal et
    if (sourceStatusId === targetStatusId) {
      console.log("Aynı duruma bırakıldı, işlem iptal edildi");
      return;
    }
    
    // Workflow geçiş kontrolü
    const isValidTransition = workflowTransitions.some(
      transition => {
        console.log(`Karşılaştırma: ${transition.fromStatus}(${typeof transition.fromStatus}) === ${sourceStatusId}(${typeof sourceStatusId}) && ${transition.toStatus}(${typeof transition.toStatus}) === ${targetStatusId}(${typeof targetStatusId})`);
        return transition.fromStatus === sourceStatusId && transition.toStatus === targetStatusId;
      }
    );

    if (!isValidTransition) {
      // Status isimlerini bul
      const sourceStatusName = statuses.find(s => parseInt(s.statusId) === sourceStatusId)?.name || `Status ${sourceStatusId}`;
      const targetStatusName = statuses.find(s => parseInt(s.statusId) === targetStatusId)?.name || `Status ${targetStatusId}`;
      
      // Geçerli geçişleri bul
      const validTransitions = workflowTransitions
        .filter(transition => transition.fromStatus === sourceStatusId)
        .map(transition => {
          const toStatusName = statuses.find(s => parseInt(s.statusId) === transition.toStatus)?.name || `Status ${transition.toStatus}`;
          return `${sourceStatusName} → ${toStatusName}`;
        })
        .join(', ');
      
      setNotification({
        type: 'warning',
        message: `"${sourceStatusName}" durumundan "${targetStatusName}" durumuna geçiş yapılamaz. ${validTransitions ? `Geçerli geçişler: ${validTransitions}` : 'Bu durumdan hiçbir geçiş tanımlanmamış.'}`
      });
      
      return; // Geçiş geçerli değilse işlemi iptal et
    }
    
    console.log(`Issue ${issueId} durumu ${sourceStatusId} -> ${targetStatusId} olarak değiştiriliyor`);
    
    try {
      // Önce UI'ı güncelle
      const updatedIssues = issues.map(issue => {
        if (String(issue.id) === issueId) {
          return { 
            ...issue, 
            statusId: targetStatusId,
            status: String(targetStatusId) // Eski API uyumluluğu için
          };
        }
        return issue;
      });
      
      setIssues(updatedIssues);
      
      // Güncellenecek issue'yu bul
      const issueToUpdate = updatedIssues.find(i => String(i.id) === issueId);
      
      if (!issueToUpdate) {
        console.error("Güncellenecek issue bulunamadı:", issueId);
        return;
      }
      
      // Custom field değerlerini JSON string'e çevir
      const customFieldValuesJson = JSON.stringify(issueToUpdate.customFieldValues || {});
      
      // API'ye gönderilecek veriyi hazırla
      const apiData = {
        projectId: issueToUpdate.projectId,
        title: issueToUpdate.title,
        description: issueToUpdate.description || "",
        typeId: parseInt(issueTypeId),
        statusId: targetStatusId,
        priorityId: issueToUpdate.priorityId || 1,
        assigneeId: issueToUpdate.assigneeId || null,
        reporterId: issueToUpdate.reporterId || 1,
        dueDate: issueToUpdate.dueDate || null,
        parentIssueId: issueToUpdate.parentIssueId || null,
        storyPoints: issueToUpdate.storyPoints || null,
        customFieldValues: customFieldValuesJson
      };
      
      console.log("Sürükleme sonrası API'ye gönderilen veri:", apiData);
      
      // API çağrısını yap
      await issueService.update(issueId, apiData);
            
      // Başarılı güncelleme bildirimi
      const sourceStatusName = statuses.find(s => parseInt(s.statusId) === sourceStatusId)?.name || `Status ${sourceStatusId}`;
      const targetStatusName = statuses.find(s => parseInt(s.statusId) === targetStatusId)?.name || `Status ${targetStatusId}`;
      
      setNotification({
        type: 'success',
        message: `Issue "${issueToUpdate.title}" durumu "${sourceStatusName}" → "${targetStatusName}" olarak güncellendi`
      });
      
    } catch (error) {
      console.error('Issue durumu güncellenirken hata oluştu:', error);
      
      // Hata durumunda UI'ı geri al
      setIssues(issues);
      
      setNotification({
        type: 'error',
        message: 'Issue durumu güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  // Notification kapatma işlevi
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Issue type'a göre icon getirme
  const getIssueTypeIcon = (typeId) => {
    if (issueType) {
      switch (issueType.name.toLowerCase()) {
        case 'bug':
          return <BugIcon color="error" fontSize="small" />;
        case 'task':
          return <TaskIcon color="primary" fontSize="small" />;
        case 'story':
          return <StoryIcon color="success" fontSize="small" />;
        default:
          return <AssignmentIcon color="primary" fontSize="small" />;
      }
    }
    return <AssignmentIcon color="primary" fontSize="small" />;
  };

  // Priority'ye göre renk al
  const getPriorityColor = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? priority.color : '#36B37E';
  };

  // Priority'ye göre isim al
  const getPriorityName = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? priority.name : 'Low';
  };

  // Custom field değerini render et
  const renderCustomFieldValue = (fieldId, value) => {
    const field = customFields.find(f => f.fieldId === fieldId);
    if (!field || !value) return null;

    switch (field.fieldType) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return value.toString();
      case 'select':
      case 'multiselect':
        return value;
      case 'email':
        return value;
      case 'user':
        const user = users.find(u => u.userId === parseInt(value));
        return user ? `${user.firstName} ${user.lastName}` : value;
      default:
        return value;
    }
  };

  // Gelişmiş Issue kartı bileşeni
  const SortableIssueCard = ({ issue }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: issue.id,
      data: {
        type: 'issue',
        issue,
        statusId: issue.statusId
      }
    });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 999 : 1,
      boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : 'none'
    };

    // Issue'ya ait custom field değerlerini al
    const issueCustomFields = issueTypeCustomFields
      .map(icf => {
        const field = customFields.find(f => f.fieldId === icf.customFieldId);
        const value = issue.customFieldValues?.[icf.customFieldId];
        return { field, value, isRequired: icf.isRequired };
      })
      .filter(item => item.field && item.value);

    // Due date kontrolü
    const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date();
    const isDueSoon = dueDate && dueDate > new Date() && dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Assignee bilgisini al
    const assignee = users.find(u => u.userId === issue.assigneeId);
    const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
    
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="issue-card"
        sx={{
          mb: 2,
          width: '100%',
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          '&:hover': { 
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
            '& .issue-actions': {
              opacity: 1
            }
          },
        }}
        data-issue-id={issue.id}
        data-status-id={issue.statusId}
      >
        {/* Priority indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: getPriorityColor(issue.priorityId),
            borderRadius: '2px 0 0 2px'
          }}
        />

        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing'
            },
            p: 2,
            pb: 1,
            borderBottom: '1px solid #F3F4F6'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1}
              sx={{ 
                flex: 1,
                minWidth: 0
              }}
            >
              {getIssueTypeIcon(issue.typeId)}
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#1F2937',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {issue.title}
              </Typography>
            </Box>
            
            <Box className="issue-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMenu(e, issue);
                }}
                sx={{ 
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <CardContent 
          sx={{ p: 2, pt: 1, '&:last-child': { pb: 2 } }}
          onClick={() => handleOpenDialog(issue)}
        >
          {/* Issue bilgileri */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            
            {/* Priority ve Story Points */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Chip
                size="small"
                label={getPriorityName(issue.priorityId)}
                sx={{
                  bgcolor: `${getPriorityColor(issue.priorityId)}15`,
                  color: getPriorityColor(issue.priorityId),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
              
              {issue.storyPoints && (
                <Chip
                  size="small"
                  label={`${issue.storyPoints} SP`}
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    borderColor: '#D1D5DB',
                    color: '#6B7280',
                    fontWeight: 500
                  }}
                />
              )}
            </Box>

            {/* Due Date */}
            {dueDate && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280' 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.75rem',
                    color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280',
                    fontWeight: isOverdue || isDueSoon ? 600 : 400
                  }}
                >
                  {dueDate.toLocaleDateString()}
                </Typography>
                {isOverdue && (
                  <Chip
                    size="small"
                    label="Overdue"
                    sx={{
                      ml: 0.5,
                      height: 18,
                      fontSize: '0.7rem',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
            )}

            {/* Custom Fields - En önemli 2 tanesini göster */}
            {issueCustomFields.length > 0 && (
              <Box>
                {issueCustomFields.slice(0, 2).map(({ field, value }) => (
                  <Box key={field.fieldId} display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: '#6B7280',
                        fontWeight: 500,
                        minWidth: 'fit-content'
                      }}
                    >
                      {field.fieldName}:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: '#374151',
                        fontWeight: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {renderCustomFieldValue(field.fieldId, value)}
                    </Typography>
                  </Box>
                ))}
                {issueCustomFields.length > 2 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.7rem',
                      color: '#9CA3AF',
                      fontStyle: 'italic'
                    }}
                  >
                    +{issueCustomFields.length - 2} more fields
                  </Typography>
                )}
              </Box>
            )}

            {/* Alt kısım - Assignee ve Progress */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              {/* Assignee */}
              {assigneeName ? (
                <Tooltip title={assigneeName}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        fontSize: '0.75rem',
                        backgroundColor: '#4F46E5',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {assigneeName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem',
                        color: '#374151',
                        fontWeight: 500,
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {assigneeName.split(' ')[0]}
                    </Typography>
                  </Box>
                </Tooltip>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: '0.75rem', 
                      bgcolor: '#F3F4F6', 
                      color: '#9CA3AF',
                      border: '2px dashed #D1D5DB'
                    }}
                  >
                    ?
                  </Avatar>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      color: '#9CA3AF',
                      fontStyle: 'italic',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    Unassigned
                  </Typography>
                </Box>
              )}

              {/* Issue ID */}
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem',
                  color: '#9CA3AF',
                  fontWeight: 500,
                  backgroundColor: '#F9FAFB',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  border: '1px solid #F3F4F6'
                }}
              >
                #{issue.id}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Sürükleme sırasında gösterilecek overlay kartı
  const DragOverlayCard = ({ issue }) => {
    if (!issue) return null;
    
    const assignee = users.find(u => u.userId === issue.assigneeId);
    const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
    
    return (
      <Card
        sx={{
          width: '320px',
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          opacity: 0.95,
          transform: 'rotate(2deg)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {/* Priority indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: getPriorityColor(issue.priorityId),
            borderRadius: '2px 0 0 2px'
          }}
        />

        <Box sx={{ p: 2, borderBottom: '1px solid #F3F4F6' }}>
          <Box display="flex" alignItems="center" gap={1}>
            {getIssueTypeIcon(issue.typeId)}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2937' }}>
              {issue.title}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              size="small"
              label={getPriorityName(issue.priorityId)}
              sx={{
                bgcolor: `${getPriorityColor(issue.priorityId)}15`,
                color: getPriorityColor(issue.priorityId),
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
            
            {assigneeName ? (
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                {assigneeName.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#F3F4F6', color: '#9CA3AF' }}>
                ?
              </Avatar>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Custom field input render fonksiyonu
  const renderCustomFieldInput = (customField) => {
    const fieldId = customField.customFieldId;
    const field = customFields.find(f => f.fieldId === fieldId);
    
    if (!field) return null;

    const fieldName = `customField_${fieldId}`;
    const fieldValue = formData.customFieldValues[fieldId] || '';
    const isRequired = customField.isRequired;
    const hasError = Boolean(formErrors[fieldName]);

    switch (field.fieldType) {
      case 'text':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            multiline
            rows={3}
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'number':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="number"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'date':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="date"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        );

      case 'datetime':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="datetime-local"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        );

      case 'select':
        const selectOptions = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        return (
          <FormControl key={fieldId} fullWidth error={hasError} required={isRequired} sx={{ mb: 2 }}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              name={fieldName}
              value={fieldValue}
              onChange={handleFormChange}
              label={field.fieldName}
              disabled={formSubmitting}
            >
              {!isRequired && (
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
              )}
              {selectOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{formErrors[fieldName]}</FormHelperText>}
            {!hasError && field.description && <FormHelperText>{field.description}</FormHelperText>}
          </FormControl>
        );

      case 'multiselect':
        const multiselectOptions = field.options ? field.options.split(',').map(opt => opt.trim()) : [];
        const multiselectValue = fieldValue ? (Array.isArray(fieldValue) ? fieldValue : fieldValue.split(',')) : [];
        
        return (
          <FormControl key={fieldId} fullWidth error={hasError} required={isRequired} sx={{ mb: 2 }}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              name={fieldName}
              multiple
              value={multiselectValue}
              onChange={(e) => {
                const value = Array.isArray(e.target.value) ? e.target.value.join(',') : e.target.value;
                handleFormChange({ target: { name: fieldName, value } });
              }}
              label={field.fieldName}
              disabled={formSubmitting}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {multiselectOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox checked={multiselectValue.indexOf(option) > -1} />
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{formErrors[fieldName]}</FormHelperText>}
            {!hasError && field.description && <FormHelperText>{field.description}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={fieldId}
            control={
              <Checkbox
                name={fieldName}
                checked={Boolean(fieldValue)}
                onChange={(e) => handleFormChange({ target: { name: fieldName, value: e.target.checked } })}
                disabled={formSubmitting}
              />
            }
            label={field.fieldName}
            sx={{ mb: 2, display: 'block' }}
          />
        );

      case 'email':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="email"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'url':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="url"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'phone':
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            type="tel"
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );

      case 'user':
        return (
          <FormControl key={fieldId} fullWidth error={hasError} required={isRequired} sx={{ mb: 2 }}>
            <InputLabel>{field.fieldName}</InputLabel>
            <Select
              name={fieldName}
              value={fieldValue}
              onChange={handleFormChange}
              label={field.fieldName}
              disabled={formSubmitting}
            >
              {!isRequired && (
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
              )}
              {users.map(user => {
                const userID = user.userId != null ? user.userId.toString() : '';
                return (
                  <MenuItem key={userID || `user-${Math.random()}`} value={userID}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {user.firstName?.charAt(0) || "?"}
                      </Avatar>
                      {user.firstName || ''} {user.lastName || ''}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
            {hasError && <FormHelperText>{formErrors[fieldName]}</FormHelperText>}
            {!hasError && field.description && <FormHelperText>{field.description}</FormHelperText>}
          </FormControl>
        );

      default:
        return (
          <TextField
            key={fieldId}
            fullWidth
            name={fieldName}
            label={field.fieldName}
            value={fieldValue}
            onChange={handleFormChange}
            error={hasError}
            helperText={hasError ? formErrors[fieldName] : field.description}
            disabled={formSubmitting}
            required={isRequired}
            sx={{ mb: 2 }}
          />
        );
    }
  };

  // Kanban Board bileşeni
  const KanbanBoard = () => {
    if (statuses.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      );
    }

    // Workflow transition'larında bulunan statüleri belirle
    const getWorkflowStatuses = () => {
      if (workflowTransitions.length === 0) {
        return statuses; // Workflow yoksa tüm statüleri göster
      }

      // Workflow'da kullanılan tüm status ID'lerini topla
      const workflowStatusIds = new Set();
      
      workflowTransitions.forEach(transition => {
        workflowStatusIds.add(transition.fromStatus);
        workflowStatusIds.add(transition.toStatus);
      });

      // Sadece workflow'da bulunan statüleri filtrele
      const filteredStatuses = statuses.filter(status => 
        workflowStatusIds.has(parseInt(status.statusId))
      );

      console.log("Workflow'da kullanılan status ID'leri:", Array.from(workflowStatusIds));
      console.log("Filtrelenmiş statüler:", filteredStatuses);

      return filteredStatuses;
    };

    const workflowStatuses = getWorkflowStatuses();

    const columns = {};
    workflowStatuses.forEach(status => {
      const statusIdStr = String(status.statusId);
      columns[statusIdStr] = issues.filter(issue => {
        if (!issue) return false;
        const issueStatusStr = String(issue.statusId || issue.status || "");
        return issueStatusStr === statusIdStr;
      });
    });
    
    const activeIssue = activeId ? issues.find(issue => String(issue.id) === String(activeId)) : null;
    
    const columnWidth = 380;
    const columnGap = 20;
    
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            gap: `${columnGap}px`,
            overflowX: 'auto',
            pb: 3,
            minHeight: '75vh',
            width: '100%',
            px: 1,
            '&::-webkit-scrollbar': {
              height: '12px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F3F4F6',
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D1D5DB',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#9CA3AF',
              }
            },
          }}
        >
          {workflowStatuses.map((status) => {
            const statusIdStr = String(status.statusId);
            const columnIssues = columns[statusIdStr] || [];
            
            return (
              <Box 
                key={`status-${statusIdStr}`} 
                sx={{ 
                  width: `${columnWidth}px`,
                  minWidth: `${columnWidth}px`,
                  flexShrink: 0,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    bgcolor: '#FAFBFC',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%)',
                  }}
                >
                  {/* Column Header */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    pb={2}
                    borderBottom="2px solid #E5E7EB"
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: status.color || '#6B7280',
                          boxShadow: `0 0 0 3px ${status.color || '#6B7280'}20`
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: '#1F2937',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {status.name}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={columnIssues.length}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: status.color || '#6B7280',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '12px'
                        }
                      }}
                    >
                      <Box />
                    </Badge>
                  </Box>

                  {/* Droppable Area */}
                  <Droppable 
                    id={`droppable-${statusIdStr}`}
                    data={{ statusId: status.statusId }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: 'calc(75vh - 120px)',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: '#F9FAFB',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#D1D5DB',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: '#9CA3AF',
                          }
                        },
                      }}
                    >
                      <SortableContext
                        items={columnIssues.map(issue => issue.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {columnIssues.length === 0 ? (
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            height="200px"
                            sx={{
                              color: '#9CA3AF',
                              textAlign: 'center',
                              border: '2px dashed #E5E7EB',
                              borderRadius: 2,
                              backgroundColor: '#FAFBFC'
                            }}
                          >
                            <AssignmentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              No issues in {status.name.toLowerCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5 }}>
                              Drag issues here or create new ones
                            </Typography>
                          </Box>
                        ) : (
                          columnIssues.map((issue) => (
                            <SortableIssueCard key={issue.id} issue={issue} />
                          ))
                        )}
                      </SortableContext>
                    </Box>
                  </Droppable>
                </Paper>
              </Box>
            );
          })}
        </Box>
        
        <DragOverlay>
          {activeIssue && <DragOverlayCard issue={activeIssue} />}
        </DragOverlay>
      </DndContext>
    );
  };

  // Status name mapping
  const statusNameMap = {};
  statuses.forEach(status => {
    statusNameMap[String(status.statusId)] = {
      name: status.name,
      color: status.color || '#6B7280'
    };
  });

  // List View bileşeni
  const ListView = () => {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Issue
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Priority
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Assignee
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Due Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Custom Fields
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <AssignmentIcon sx={{ fontSize: 64, color: '#D1D5DB' }} />
                    <Typography variant="h6" color="text.secondary">
                      No issues found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first issue to get started
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{
                        mt: 2,
                        backgroundColor: '#4F46E5',
                        '&:hover': { backgroundColor: '#4338CA' }
                      }}
                    >
                      Create Issue
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => {
                const issueStatusStr = String(issue.statusId || issue.status || "");
                const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
                const isOverdue = dueDate && dueDate < new Date();
                const assignee = users.find(u => u.userId === issue.assigneeId);
                const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;

                // Issue'ya ait custom field değerlerini al
                const issueCustomFields = issueTypeCustomFields
                  .map(icf => {
                    const field = customFields.find(f => f.fieldId === icf.customFieldId);
                    const value = issue.customFieldValues?.[icf.customFieldId];
                    return { field, value };
                  })
                  .filter(item => item.field && item.value);

                return (
                  <TableRow 
                    key={issue.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer'
                      },
                      borderLeft: `4px solid ${getPriorityColor(issue.priorityId)}`,
                    }}
                    onClick={() => handleOpenDialog(issue)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getIssueTypeIcon(issue.typeId)}
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#1F2937',
                                mb: 0.5
                              }}
                            >
                              {issue.title}
                            </Typography>
                            {issue.description && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6B7280',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {issue.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            #{issue.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusNameMap[issueStatusStr]?.name || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: `${statusNameMap[issueStatusStr]?.color}20` || '#F3F4F6',
                          color: statusNameMap[issueStatusStr]?.color || '#6B7280',
                          fontWeight: 600,
                          border: `1px solid ${statusNameMap[issueStatusStr]?.color}40` || '#E5E7EB'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getPriorityName(issue.priorityId)}
                        sx={{
                          bgcolor: `${getPriorityColor(issue.priorityId)}15`,
                          color: getPriorityColor(issue.priorityId),
                          fontWeight: 600,
                          border: `1px solid ${getPriorityColor(issue.priorityId)}40`
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {assigneeName ? (
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {assigneeName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assigneeName}
                          </Typography>
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.875rem', 
                            bgcolor: '#F3F4F6', 
                            color: '#9CA3AF',
                            border: '2px dashed #D1D5DB'
                          }}>
                            ?
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Unassigned
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {dueDate ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon 
                            sx={{ 
                              fontSize: 16, 
                              color: isOverdue ? '#EF4444' : '#6B7280' 
                            }} 
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: isOverdue ? '#EF4444' : '#374151',
                              fontWeight: isOverdue ? 600 : 400
                            }}
                          >
                            {dueDate.toLocaleDateString()}
                          </Typography>
                          {isOverdue && (
                            <Chip
                              size="small"
                              label="Overdue"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {issueCustomFields.length > 0 ? (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {issueCustomFields.slice(0, 2).map(({ field, value }) => (
                            <Box key={field.fieldId} display="flex" alignItems="center" gap={0.5}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '0.7rem',
                                  color: '#6B7280',
                                  fontWeight: 500,
                                  minWidth: 'fit-content'
                                }}
                              >
                                {field.fieldName}:
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '0.7rem',
                                  color: '#374151',
                                  fontWeight: 400
                                }}
                              >
                                {renderCustomFieldValue(field.fieldId, value)}
                              </Typography>
                            </Box>
                          ))}
                          {issueCustomFields.length > 2 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.7rem',
                                color: '#9CA3AF',
                                fontStyle: 'italic'
                              }}
                            >
                              +{issueCustomFields.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No custom fields
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, issue);
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => {
              if (projectId) {
                navigate(`/project/${projectId}/boards`);
              } else {
                navigate('/projects');
              }
            }}
            sx={{ 
              backgroundColor: '#F3F4F6',
              '&:hover': { backgroundColor: '#E5E7EB' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="700" color="#111827">
              {issueType?.name} Board
              {projectId && project && (
                <Typography component="span" sx={{ color: '#6B7280', fontSize: '1rem', ml: 1 }}>
                  - {project.name}
                </Typography>
              )}
            </Typography>
            <Typography variant="body1" color="#6B7280">
              {projectId && project ? 
                `${project.name} - ${issues.length} issues` : 
                `${issues.length} issues`
              }
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#4F46E5',
            '&:hover': { backgroundColor: '#4338CA' },
            textTransform: 'none',
            fontWeight: '600',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          Create Issue
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <Box textAlign="center">
            <CircularProgress size={48} sx={{ color: '#4F46E5' }} />
            <Typography variant="body1" sx={{ mt: 2, color: '#6B7280' }}>
              Loading board data...
            </Typography>
          </Box>
        </Box>
      ) : error ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          height="60vh"
        >
          <Typography color="error" variant="h6" gutterBottom sx={{ fontFamily: 'inherit' }}>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => { fetchData(); fetchWorkflow(); }} 
            startIcon={<RefreshIcon />}
            sx={{ 
              mt: 2,
              textTransform: 'none',
              fontFamily: 'inherit'
            }}
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          {/* Debug Info - Sadece development için */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="caption" color="#6B7280">
                Debug: ProjectId={projectId}, IssueTypeId={issueTypeId}, Total Issues={issues.length}
              </Typography>
            </Box>
          )}

          {/* View Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  color: '#6B7280',
                  '&.Mui-selected': {
                    color: '#4F46E5'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4F46E5',
                  height: 3,
                  borderRadius: '2px 2px 0 0'
                }
              }}
            >
              <Tab label="Kanban Board" />
              <Tab label="List View" />
            </Tabs>
          </Box>

          {/* Content */}
          {statuses.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="60vh"
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                p: 4
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#374151' }}>
                No Statuses Defined
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#6B7280', maxWidth: '400px' }}>
                Before you can start managing issues, you need to define statuses for your workflow.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = '/admin/issue-status'}
                sx={{ 
                  mt: 2,
                  backgroundColor: '#4F46E5',
                  '&:hover': { backgroundColor: '#4338CA' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              >
                Define Statuses
              </Button>
            </Box>
          ) : workflowTransitions.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="60vh"
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                p: 4
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#374151' }}>
                No Workflow Defined
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#6B7280', maxWidth: '400px' }}>
                This issue type doesn't have a workflow configured yet. Create a workflow to enable drag & drop functionality.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = '/admin/workflows'}
                sx={{ 
                  mt: 2,
                  backgroundColor: '#4F46E5',
                  '&:hover': { backgroundColor: '#4338CA' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              >
                Create Workflow
              </Button>
            </Box>
          ) : (
            currentTab === 0 ? <KanbanBoard /> : <ListView />
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: 160
          }
        }}
      >
        <MenuItem 
          onClick={() => { handleOpenDialog(selectedIssue); handleCloseMenu(); }}
          sx={{
            fontFamily: 'inherit',
            '&:hover': {
              backgroundColor: '#F3F4F6'
            }
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Edit Issue
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteIssue(selectedIssue?.id)}
          sx={{ 
            color: '#EF4444',
            fontFamily: 'inherit',
            '&:hover': {
              backgroundColor: '#FEF2F2'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete Issue
        </MenuItem>
      </Menu>

      {/* Add/Edit Issue Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#111827',
          fontFamily: 'inherit',
          borderBottom: '1px solid #F3F4F6',
          pb: 2
        }}>
          {editingIssue ? 'Edit Issue' : 'Create New Issue'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            {/* Basic Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Basic Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="title"
                  label="Issue Title"
                  fullWidth
                  size="small"
                  value={formData.title}
                  onChange={handleFormChange}
                  error={Boolean(formErrors.title)}
                  helperText={formErrors.title}
                  disabled={formSubmitting}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontFamily: 'inherit',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: 'inherit',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth error={Boolean(formErrors.statusId)} required size="small">
                    <InputLabel sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>Status</InputLabel>
                    <Select
                      name="statusId"
                      value={formData.statusId}
                      onChange={handleFormChange}
                      label="Status"
                      disabled={formSubmitting}
                      sx={{
                        '& .MuiSelect-select': {
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      {statuses.map(status => (
                        <MenuItem key={status.statusId} value={status.statusId}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: status.color || '#6B7280'
                              }}
                            />
                            <Typography sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
                              {status.name}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.statusId && <FormHelperText sx={{ fontSize: '0.75rem' }}>{formErrors.statusId}</FormHelperText>}
                  </FormControl>
                  
                  <FormControl fullWidth error={Boolean(formErrors.priorityId)} size="small">
                                        <InputLabel sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>Priority</InputLabel>
                    <Select
                      name="priorityId"
                      value={formData.priorityId}
                      onChange={handleFormChange}
                      label="Priority"
                      disabled={formSubmitting}
                      sx={{
                        '& .MuiSelect-select': {
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      {priorities.map(priority => (
                        <MenuItem key={priority.id} value={priority.id}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: priority.color
                              }}
                            />
                            <Typography sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
                              {priority.name}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.priorityId && <FormHelperText sx={{ fontSize: '0.75rem' }}>{formErrors.priorityId}</FormHelperText>}
                  </FormControl>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth error={Boolean(formErrors.projectId)} required size="small">
                    <InputLabel sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>Project</InputLabel>
                    <Select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleFormChange}
                      label="Project"
                      disabled={formSubmitting}
                      sx={{
                        '& .MuiSelect-select': {
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          <Typography sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
                            {project.name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.projectId && <FormHelperText sx={{ fontSize: '0.75rem' }}>{formErrors.projectId}</FormHelperText>}
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>Assignee</InputLabel>
                    <Select
                      name="assigneeId"
                      value={formData.assigneeId}
                      onChange={handleFormChange}
                      label="Assignee"
                      disabled={formSubmitting}
                      sx={{
                        '& .MuiSelect-select': {
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em style={{ fontSize: '0.875rem' }}>Unassigned</em>
                      </MenuItem>
                      {users.map(user => {
                        const userID = user.userId != null ? user.userId.toString() : '';
                        
                        return (
                          <MenuItem key={userID || `user-${Math.random()}`} value={userID}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                                {user.firstName?.charAt(0) || "?"}
                              </Avatar>
                              <Typography sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
                                {user.firstName || ''} {user.lastName || ''}
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
                
                <TextField
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  value={formData.description}
                  onChange={handleFormChange}
                  disabled={formSubmitting}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontFamily: 'inherit',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: 'inherit',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="storyPoints"
                    label="Story Points"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.storyPoints || ''}
                    onChange={handleFormChange}
                    disabled={formSubmitting}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontFamily: 'inherit',
                        fontSize: '0.875rem'
                      },
                      '& .MuiInputBase-input': {
                        fontFamily: 'inherit',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  
                  <TextField
                    name="dueDate"
                    label="Due Date"
                    type="date"
                    fullWidth
                    size="small"
                    value={formData.dueDate || ''}
                    onChange={handleFormChange}
                    disabled={formSubmitting}
                    InputLabelProps={{
                      shrink: true,
                      sx: { fontFamily: 'inherit', fontSize: '0.875rem' }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'inherit',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Custom Fields Section */}
            {issueTypeCustomFields.length > 0 && (
              <Box>
                <Divider sx={{ my: 3 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Custom Fields
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {issueTypeCustomFields.map((customField) => (
                    <Box key={customField.customFieldId}>
                      {renderCustomFieldInput(customField)}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #F3F4F6' }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={formSubmitting}
            sx={{ 
              textTransform: 'none',
              fontFamily: 'inherit',
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F9FAFB'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveIssue}
            variant="contained"
            disabled={formSubmitting}
            sx={{
              backgroundColor: '#4F46E5',
              '&:hover': { backgroundColor: '#4338CA' },
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: 'inherit',
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:disabled': {
                backgroundColor: '#D1D5DB'
              }
            }}
            startIcon={formSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {formSubmitting ? 'Saving...' : (editingIssue ? 'Update Issue' : 'Create Issue')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.type || 'info'}
          variant="filled"
          sx={{
            fontFamily: 'inherit',
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Board;

                    


