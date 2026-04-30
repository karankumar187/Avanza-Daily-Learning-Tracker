import React, { useState, useEffect } from 'react';
import { objectivesAPI, progressAPI } from '../services/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Plus, Target, Edit2, Trash2, Search, Book, Code, Briefcase, Heart, Star, Zap, Coffee, Music, Camera, Globe, Monitor, PenTool, Palette, Dumbbell, Languages, Calculator, Beaker, X, FileText, BookOpen, ExternalLink,
  // CSE additions
  Cpu, Database, Server, Network, Terminal, GitBranch, Cloud, Shield, Wifi, Bug, Smartphone, LayoutDashboard, BarChart2, Boxes, Braces, Binary, Layers, FlaskConical, BrainCircuit, Lock, TestTube2, Microchip, CodeXml, FolderGit2, CircuitBoard, HardDrive, Webhook, Workflow, Bot, FileCode2
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const iconOptions = [
  // General / Study
  { value: 'Book',       icon: Book,            label: 'Book' },
  { value: 'General',   icon: Target,           label: 'Target' },
  { value: 'Math',      icon: Calculator,       label: 'Math' },
  { value: 'Science',   icon: Beaker,           label: 'Science' },
  { value: 'Language',  icon: Languages,        label: 'Language' },
  { value: 'Globe',     icon: Globe,            label: 'Globe' },
  { value: 'Fitness',   icon: Dumbbell,         label: 'Fitness' },
  { value: 'Music',     icon: Music,            label: 'Music' },
  { value: 'Art',       icon: Palette,          label: 'Art' },

  // Programming & CS Core
  { value: 'Code',      icon: Code,             label: 'Code' },
  { value: 'Terminal',  icon: Terminal,         label: 'Terminal' },
  { value: 'Braces',    icon: Braces,           label: 'Braces' },
  { value: 'Binary',    icon: Binary,           label: 'Binary' },
  { value: 'Bug',       icon: Bug,              label: 'Debug' },
  { value: 'FileCode',  icon: FileCode2,        label: 'FileCode' },
  { value: 'CodeXml',   icon: CodeXml,          label: 'XML/HTML' },

  // Data Structures & Algorithms
  { value: 'Layers',    icon: Layers,           label: 'Layers / DSA' },
  { value: 'Workflow',  icon: Workflow,         label: 'Workflow / Graphs' },
  { value: 'Boxes',     icon: Boxes,            label: 'Boxes / DS' },

  // Systems & Hardware
  { value: 'Cpu',       icon: Cpu,              label: 'CPU' },
  { value: 'Circuit',   icon: CircuitBoard,     label: 'Circuit' },
  { value: 'HardDrive', icon: HardDrive,        label: 'OS / Storage' },
  { value: 'Microchip', icon: Microchip,        label: 'Microchip' },

  // Networks & Cloud
  { value: 'Network',   icon: Network,          label: 'Networks' },
  { value: 'Wifi',      icon: Wifi,             label: 'Wireless' },
  { value: 'Server',    icon: Server,           label: 'Server' },
  { value: 'Cloud',     icon: Cloud,            label: 'Cloud' },
  { value: 'Webhook',   icon: Webhook,          label: 'API / Webhook' },

  // Databases
  { value: 'Database',  icon: Database,         label: 'Database' },
  { value: 'HardDrive2',icon: HardDrive,        label: 'Storage' },

  // AI / ML / Data Science
  { value: 'Brain',     icon: BrainCircuit,     label: 'AI / ML' },
  { value: 'Flask',     icon: FlaskConical,     label: 'ML Experiments' },
  { value: 'BarChart',  icon: BarChart2,        label: 'Data Science' },
  { value: 'Bot',       icon: Bot,              label: 'Bot / Automation' },

  // Security & DevOps
  { value: 'Shield',    icon: Shield,           label: 'Security' },
  { value: 'Lock',      icon: Lock,             label: 'Cyber / Auth' },
  { value: 'GitBranch', icon: GitBranch,        label: 'Git / VCS' },
  { value: 'FolderGit', icon: FolderGit2,       label: 'Git Repo' },
  { value: 'TestTube',  icon: TestTube2,        label: 'Testing' },

  // Web & Mobile
  { value: 'Monitor',   icon: Monitor,          label: 'Web / UI' },
  { value: 'Layout',    icon: LayoutDashboard,  label: 'Dashboard / UI' },
  { value: 'Smartphone',icon: Smartphone,       label: 'Mobile Dev' },
];

const colorOptions = [
  '#4A7C59', '#6FAF82', '#B5895A', '#f59e0b', '#10b981',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#3b82f6'
];

const Objectives = () => {
  const [objectives, setObjectives] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [progressData, setProgressData] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    color: '#4A7C59',
    icon: 'Book',
    url: ''
  });

  useEffect(() => {
    fetchObjectives();
    fetchCategories();
  }, []);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      // Only show active objectives so soft-deleted ones disappear from the list
      const response = await objectivesAPI.getAll({ isActive: true });
      setObjectives(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch objectives');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await objectivesAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingObjective) {
        await objectivesAPI.update(editingObjective._id, formData);
        toast.success('Objective updated successfully');
      } else {
        await objectivesAPI.create(formData);
        toast.success('Objective created successfully');
      }
      setShowModal(false);
      setEditingObjective(null);
      resetForm();
      fetchObjectives();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this objective?')) return;

    try {
      await objectivesAPI.delete(id);
      toast.success('Objective deleted successfully');

      // Animate deletion
      gsap.to(`[data-objective-id="${id}"]`, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => fetchObjectives()
      });
    } catch (error) {
      toast.error('Failed to delete objective');
    }
  };

  const handleEdit = (objective) => {
    setEditingObjective(objective);
    setFormData({
      title: objective.title,
      description: objective.description || '',
      category: objective.category,
      priority: objective.priority,
      color: objective.color,
      icon: objective.icon,
      url: objective.url || ''
    });
    setShowModal(true);
  };

  const handleViewProgress = async (objective) => {
    try {
      // No date range → backend returns ALL records for this objective
      const response = await objectivesAPI.getWithProgress(objective._id);
      setSelectedObjective(response.data.data.objective);
      setProgressData(response.data.data.progress);
      setShowProgressModal(true);
    } catch (error) {
      toast.error('Failed to fetch progress data');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      color: '#4A7C59',
      icon: 'Book',
      url: ''
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(i => i.value === iconName);
    return iconOption ? iconOption.icon : BookOpen;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <Clock className="w-5 h-5 text-green-700" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'missed':
        return 'bg-red-100 text-red-700';
      case 'skipped':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || obj.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || obj.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // GSAP Animations
  useGSAP(() => {
    if (!loading && filteredObjectives.length > 0) {
      gsap.from('.objective-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'all' // prevents GSAP from leaving inline opacity/transform styles that conflict with Tailwind hover
      });
    }
  }, [loading, filteredObjectives.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Learning Objectives</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your learning goals and track progress</p>
        </div>
        <button
          onClick={() => {
            setEditingObjective(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-800 dark:bg-slate-700 text-white font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Objective
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Objectives Grid */}
      {filteredObjectives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredObjectives.map((objective) => {
            const IconComponent = getIconComponent(objective.icon);
            return (
              <div
                key={objective._id}
                data-objective-id={objective._id}
                className="objective-card group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-gray-100 dark:border-slate-800"
                onClick={() => handleViewProgress(objective)}
              >
                {/* Left accent stripe — only place objective color is prominent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm"
                  style={{ backgroundColor: objective.color }}
                />

                {/* ── HERO SECTION — themed, not objective-colored ─── */}
                <div className="relative h-36 bg-gray-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-slate-700">
                  {/* Subtle warm pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4A7C59 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6FAF82 0%, transparent 50%)' }}
                  />

                  {/* Icon container — objective color used lightly as tint */}
                  <div
                    className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: `${objective.color}18`,
                      border: `1.5px solid ${objective.color}30`
                    }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: objective.color }} />
                  </div>

                  {/* Priority badge — uses theme green/grey, not objective color */}
                  <span className={`absolute top-3 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${getPriorityClass(objective.priority)}`}>
                    {objective.priority}
                  </span>

                  {/* Edit / Delete — top right, appear on hover */}
                  <div
                    className="absolute top-2.5 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEdit(objective)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-sm transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(objective._id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* ── CARD BODY — full theme colors ─────────────── */}
                <div className="pl-6 pr-5 pt-4 pb-4">
                  {/* Title + resource link */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100 leading-snug line-clamp-1 group-hover:text-green-800 dark:group-hover:text-green-400 transition-colors">
                      {objective.title}
                    </h3>
                    {objective.url && (
                      <a
                        href={objective.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-green-700 dark:hover:text-green-400 transition-colors mt-0.5"
                        title="Open learning resource"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2 mb-4">
                    {objective.description || 'No description provided.'}
                  </p>

                  {/* Footer divider */}
                  <div className="border-t border-gray-50 dark:border-slate-800 pt-3 flex items-center justify-between">
                    {/* Category — objective color as a small dot only */}
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: objective.color }}
                      />
                      {objective.category || 'General'}
                    </span>

                    {/* View Progress CTA */}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors font-medium">
                      View Progress
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No objectives found</h3>
          <p className="text-gray-500 mb-4">Create your first learning objective to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Objective
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editingObjective ? 'Edit Objective' : 'Add New Objective'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Enter objective title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Resource URL (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="form-input pl-10"
                    placeholder="https://example.com/course"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    list="categories"
                    className="form-input"
                    placeholder="Enter or select category"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon <span className="text-xs font-normal text-gray-400 ml-1">({iconOptions.length} available — hover for label)</span>
                </label>
                <div className="max-h-48 overflow-y-auto pr-1 rounded-lg border border-gray-100 dark:border-slate-700 p-2 bg-gray-50 dark:bg-slate-800/50">
                  <div className="grid grid-cols-8 gap-1.5">
                    {iconOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          title={option.label}
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={`relative group/icon p-2 rounded-lg border transition-all flex items-center justify-center ${
                            formData.icon === option.value
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/30 shadow-sm'
                              : 'border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${formData.icon === option.value ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                          />
                          {/* Tooltip */}
                          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 text-white text-[10px] px-1.5 py-0.5 opacity-0 group-hover/icon:opacity-100 transition-opacity z-10">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 transition-colors"
                >
                  {editingObjective ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && selectedObjective && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedObjective.color + '20' }}
                >
                  {React.createElement(getIconComponent(selectedObjective.icon), {
                    className: 'w-5 h-5',
                    style: { color: selectedObjective.color }
                  })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedObjective.title}</h3>
                  <p className="text-sm text-gray-500">
                    All-time record · {progressData.length} {progressData.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats summary bar */}
            {progressData.length > 0 && (() => {
              const completed = progressData.filter(p => p.status === 'completed').length;
              const missed    = progressData.filter(p => p.status === 'missed').length;
              const skipped   = progressData.filter(p => p.status === 'skipped').length;
              const total     = progressData.length;
              const rate      = Math.round((completed / total) * 100);
              return (
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total',     value: total,     color: 'text-gray-700 dark:text-gray-200',  bg: 'bg-gray-50 dark:bg-slate-800' },
                    { label: 'Completed', value: completed, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Missed',    value: missed,    color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Rate',      value: `${rate}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {progressData.length > 0 ? (
              <div className="space-y-3">
                {progressData.map((progress) => (
                  <div
                    key={progress._id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(progress.status)}
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(progress.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC'  // match UTC-based scheduling
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(progress.status)}`}>
                        {progress.status}
                      </span>
                    </div>

                    {progress.notes && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-medium">Learning Notes</span>
                        </div>
                        <p className="text-sm text-gray-700">{progress.notes}</p>
                      </div>
                    )}

                    {progress.remarks && !progress.notes && (
                      <p className="text-sm text-gray-500 mt-2">{progress.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No progress data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Objectives;
