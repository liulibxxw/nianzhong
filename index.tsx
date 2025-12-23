
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  X, 
  Loader2, 
  ChevronLeft, 
  Hash, 
  ArrowUp, 
  ChevronDown, 
  PlusCircle, 
  Check, 
  Send, 
  Layers, 
  FileText, 
  CheckSquare, 
  ArrowRight, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Type, 
  Palette, 
  Search,
  Tags
} from 'lucide-react';
import domtoimage from 'dom-to-image-more';

interface SummaryItem {
  id: string;
  title: string;
  date: string;
  category: string;
  type: string;
  content: string;
  thoughts: string;
}

interface SummaryData {
  mainTitle: string;
  author: string;
  year: string;
  intro: string;
  summaryType: string;
  wordCount: string;
  themeId: string;
  savedCategories: string[];
  savedTypes: string[];
  items: SummaryItem[];
}

interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  accent: string;
  text: string;
  secondary: string;
  card: string;
}

const THEMES: ThemeConfig[] = [
  { id: 'rose', name: '落霞红', bg: '#FFF5F5', accent: '#C53030', text: '#2D3748', secondary: '#9B2C2C', card: 'rgba(255,255,255,0.5)' },
  { id: 'ivory', name: '象牙白', bg: '#F7F4F0', accent: '#3E6B5D', text: '#1A1A1A', secondary: '#8C8276', card: 'rgba(255,255,255,0.5)' },
  { id: 'midnight', name: '暗夜金', bg: '#111111', accent: '#D4A373', text: '#FFFFFF', secondary: '#666666', card: 'rgba(255,255,255,0.05)' },
  { id: 'azure', name: '远洋蓝', bg: '#EBF4FF', accent: '#2B6CB0', text: '#1A202C', secondary: '#718096', card: 'rgba(255,255,255,0.6)' }
];

const COLOR_PRESETS = [
  '#000000', '#C53030', '#3E6B5D', '#2B6CB0', '#D4A373', '#718096', '#9B2C2C', '#FFFFFF'
];

const TEXTURE_URL = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3dyZlZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZiZ6Np9LAAAAFnRSTlMAp79vj6uXm59/f39/f39/f39/f39/f398C9mBAAAAelURBVDjL7ZFBCsAwDMNisv//766mS7vtoYORXAiBhC8m8mIyLybyYiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJi8m/mBfNNCFmS0XyXAAAAAElFTkSuQmCC")`;

const App = () => {
  const [data, setData] = useState<SummaryData>({
    mainTitle: '衔书又止',
    author: '琉璃',
    year: '2025',
    wordCount: '0',
    intro: '人类总喜欢给万物下定义，好像不说清楚我是谁、你是什么，第二天太阳就不会升起来一样',
    summaryType: '彩云易散琉璃脆',
    themeId: 'rose',
    savedCategories: [],
    savedTypes: [],
    items: [
      {
        id: 'init-1',
        title: '岁末起始',
        date: '2025.01.01',
        category: '未分类',
        type: 'TAG',
        content: '这是一个新篇章的开始。文字是时间的锚点，记录下这些琐碎，便是留住了流沙。',
        thoughts: '当时写下这段话的时候，窗外正下着小雨。有些感慨，但也对未来充满期待。'
      }
    ]
  });

  const [showConfig, setShowConfig] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSubMode, setExportSubMode] = useState<'main' | 'select'>('main');
  const [newCatInput, setNewCatInput] = useState('');
  const [newTypeInput, setNewTypeInput] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [scale, setScale] = useState(1);
  const [canvasRealHeight, setCanvasRealHeight] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [activePicker, setActivePicker] = useState<{id: string, type: 'category' | 'type'} | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  
  const [toolbarMode, setToolbarMode] = useState<'normal' | 'batch'>('normal');
  const [showFontSizeSlider, setShowFontSizeSlider] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(16);

  const currentTheme = THEMES.find(t => t.id === data.themeId) || THEMES[0];
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const [renderingItems, setRenderingItems] = useState<SummaryItem[]>([]);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const targetWidth = 1440;
      const newScale = width / targetWidth;
      setScale(newScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setCanvasRealHeight(entry.target.scrollHeight);
      }
    });
    resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, [data.items.length, data.intro]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 400);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addNewItem = () => {
    const newItem: SummaryItem = {
      id: Date.now().toString(),
      title: '点击编辑标题',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      category: data.savedCategories[0] || '未分类',
      type: data.savedTypes[0] || 'TAG',
      content: '点击这里开始记录你的故事...',
      thoughts: '写下关于这条记录的个人感悟...'
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateDataField = (field: keyof Omit<SummaryData, 'items' | 'savedCategories' | 'savedTypes'>, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateItemField = (id: string, field: keyof SummaryItem, value: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handlePaste = (id: string, field: keyof SummaryItem, e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    // 插入纯文本
    document.execCommand('insertText', false, text);
    
    // 强制立即同步到状态，防止 ResizeObserver 触发的重绘导致 DOM 内容被旧状态覆盖
    const target = e.currentTarget as HTMLElement;
    updateItemField(id, field, target.innerHTML);
  };

  const addCategory = () => {
    if (newCatInput.trim()) {
      setData(prev => ({
        ...prev,
        savedCategories: [...new Set([...prev.savedCategories, newCatInput.trim()])]
      }));
      setNewCatInput('');
    }
  };

  const addType = () => {
    if (newTypeInput.trim()) {
      setData(prev => ({
        ...prev,
        savedTypes: [...new Set([...prev.savedTypes, newTypeInput.trim()])]
      }));
      setNewTypeInput('');
    }
  };

  const applyStyle = (command: string, value: string | null = null) => {
    if (command === 'fontSize' && value) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '7');
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const container = selection.anchorNode?.parentElement;
        if (container) {
          const fonts = container.querySelectorAll('font, span');
          fonts.forEach(el => {
            if ((el as HTMLElement).style.fontSize === 'xxx-large' || (el as HTMLFontElement).size === '7') {
              (el as HTMLElement).style.fontSize = `${value}px`;
              if ((el as HTMLFontElement).size) (el as HTMLFontElement).removeAttribute('size');
            }
          });
        }
      }
    } else {
      document.execCommand(command, false, value || undefined);
    }
  };

  const batchModifyAlignment = (align: string) => {
    if (!batchSearchTerm.trim()) {
      alert('请先输入要搜索的关键词');
      return;
    }
    
    setData(prev => {
      const newItems = prev.items.map(item => {
        const processHtml = (html: string) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
          const body = doc.body.firstChild as HTMLElement;
          
          const nodes = Array.from(body.childNodes);
          nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (node.textContent?.includes(batchSearchTerm)) {
                const wrapper = document.createElement('div');
                wrapper.style.textAlign = align;
                node.parentNode?.replaceChild(wrapper, node);
                wrapper.appendChild(node);
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.innerText.includes(batchSearchTerm)) {
                el.style.textAlign = align;
              }
            }
          });
          return body.innerHTML;
        };

        return {
          ...item,
          content: processHtml(item.content),
          thoughts: processHtml(item.thoughts)
        };
      });
      return { ...prev, items: newItems };
    });
    alert(`已完成对关键词 "${batchSearchTerm}" 所在段落的批量对齐`);
  };

  const captureCanvas = async () => {
    if (!exportContainerRef.current) return null;
    try {
      const node = exportContainerRef.current;
      await new Promise(r => setTimeout(r, 500));
      const dataUrl = await domtoimage.toPng(node, {
        width: 1440,
        height: node.scrollHeight,
        quality: 1,
        cacheBust: true,
      });
      return dataUrl;
    } catch (err) {
      console.error('Capture failed', err);
      return null;
    }
  };

  const handleExportLong = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    setExportProgress(0);
    setRenderingItems(data.items);
    await new Promise(r => setTimeout(r, 800));
    
    const url = await captureCanvas();
    if (url) {
      setPreviewUrls([url]);
      setIsPreviewing(true);
    } else {
      alert('导出长图失败，文本可能超出了浏览器渲染极限');
    }
    setIsExporting(false);
    setRenderingItems([]);
  };

  const handleExportSelectedPreview = async () => {
    if (selectedItemIds.length === 0) {
      alert('请先选择要导出的时间轴序号');
      return;
    }
    setShowExportMenu(false);
    setIsExporting(true);
    setExportProgress(0);
    
    const itemsToExport = data.items.filter(i => selectedItemIds.includes(i.id));
    const urls: string[] = [];
    
    for (let i = 0; i < itemsToExport.length; i++) {
      setExportProgress(Math.round(((i) / itemsToExport.length) * 100));
      setRenderingItems([itemsToExport[i]]);
      await new Promise(r => setTimeout(r, 800));
      const url = await captureCanvas();
      if (url) urls.push(url);
    }

    setExportProgress(100);
    if (urls.length > 0) {
      setPreviewUrls(urls);
      setIsPreviewing(true);
    } else {
      alert('导出选中项失败');
    }
    setIsExporting(false);
    setRenderingItems([]);
  };

  const handleExportAllPages = async () => {
    if (data.items.length === 0) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportProgress(0);
    
    const urls: string[] = [];
    for (let i = 0; i < data.items.length; i++) {
      setExportProgress(Math.round(((i) / data.items.length) * 100));
      setRenderingItems([data.items[i]]);
      await new Promise(r => setTimeout(r, 800));
      const url = await captureCanvas();
      if (url) urls.push(url);
    }
    
    setExportProgress(100);
    if (urls.length > 0) {
      setPreviewUrls(urls);
      setIsPreviewing(true);
    } else {
      alert('批量导出失败');
    }
    setIsExporting(false);
    setRenderingItems([]);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const InlinePicker = ({ id, type, currentVal }: { id: string, type: 'category' | 'type', currentVal: string }) => {
    const list = type === 'category' ? data.savedCategories : data.savedTypes;
    return (
      <div className="absolute top-[calc(100%+16px)] left-0 z-[100] w-[220px] bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-white p-1.5 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 origin-top-left" onClick={e => e.stopPropagation()}>
        <div className="max-h-[500px] overflow-y-auto no-scrollbar py-1">
          {list.length > 0 ? list.map((val, i) => (
            <button 
              key={i} 
              onClick={() => {
                updateItemField(id, type, val);
                setActivePicker(null);
              }}
              className={`w-full group relative flex items-center px-4 py-3 rounded-[24px] transition-all duration-300 ${val === currentVal ? 'bg-black/5' : 'hover:bg-black/[0.03] active:scale-[0.96]'}`}
            >
              <div className={`w-1.5 h-6 rounded-full mr-3 transition-all duration-300 ${val === currentVal ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} style={{ backgroundColor: currentTheme.accent }}></div>
              <span className={`text-[40px] font-black leading-none tracking-tighter truncate ${type === 'type' ? 'italic font-serif' : ''}`} style={{ color: val === currentVal ? currentTheme.accent : 'inherit' }}>{val}</span>
            </button>
          )) : (
            <div className="py-8 px-4 text-center flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-1">
                <PlusCircle size={24} className="text-black/20" />
              </div>
              <p className="text-[40px] font-black text-black/30 leading-none">暂无</p>
              <button onClick={() => { setActivePicker(null); setShowTagManager(true); }} className="text-[20px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-colors underline decoration-2 underline-offset-4">去添加</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SummaryCanvas = ({ itemsToRender, isExport = false }: { itemsToRender: SummaryItem[], isExport?: boolean }) => (
    <div 
      ref={isExport ? exportContainerRef : canvasRef}
      style={{ 
        width: '1440px',
        backgroundColor: currentTheme.bg,
        minHeight: isExport ? '0' : '2560px',
        paddingBottom: '30px'
      }}
      className={`text-[${currentTheme.text}] pt-[20px] px-[100px] flex flex-col relative transition-colors duration-700 overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: TEXTURE_URL, backgroundSize: '64px 64px' }}></div>
      
      <div className="w-full flex flex-col mb-[20px] relative z-10 shrink-0">
        <div className="flex justify-between items-end border-b-[4px] border-current pb-8 mb-[60px]" style={{ color: currentTheme.text }}>
          <div className="flex flex-col">
            <span contentEditable={!isExport} suppressContentEditableWarning onBlur={(e) => updateDataField('summaryType', e.currentTarget.innerHTML)} className={`font-serif text-[32px] tracking-[0.2em] font-black outline-none`}>
              {data.summaryType}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[22px] tracking-[0.3em] font-bold block uppercase opacity-60">ISSUE NO. {data.year.slice(-2)}</span>
            <span className="font-mono text-[22px] tracking-[0.3em] font-bold uppercase whitespace-nowrap opacity-60">ARCHIVE INDEX 001</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-[40px] items-start">
          <div className="col-span-1 flex flex-col items-center pt-8">
             <div className="rotate-180 [writing-mode:vertical-lr] font-serif text-[130px] font-black leading-none tracking-widest select-none outline-none opacity-20">{data.year}</div>
             <div className="w-[4px] h-[300px] mt-8 opacity-20" style={{ backgroundColor: currentTheme.accent }}></div>
          </div>

          <div className="col-span-11 pl-10 relative">
            <div className="absolute -left-[40px] top-[40px] w-[80px] h-[8px]" style={{ backgroundColor: currentTheme.accent }}></div>
            <div className="relative mb-4">
              <div className="flex items-end mb-4">
                <div className="flex-1 relative">
                  <span className="absolute -top-[35px] left-2 text-[20px] font-mono font-bold tracking-[0.8em] uppercase opacity-40">Yearly Chronicle</span>
                  <div className="absolute -left-6 top-8 w-40 h-40 rounded-full -z-10 opacity-10" style={{ backgroundColor: currentTheme.accent }}></div>
                  <h1 contentEditable={!isExport} suppressContentEditableWarning onBlur={(e) => updateDataField('mainTitle', e.currentTarget.innerHTML)} className={`text-[170px] font-serif font-black leading-[1.1] tracking-tighter outline-none relative`} style={{ backgroundImage: `linear-gradient(to right, ${currentTheme.text} 55%, ${currentTheme.accent} 55%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    {data.mainTitle}
                  </h1>
                  <div className="flex items-center gap-4 mt-[-15px] mb-8">
                    <div className="h-[2px] w-20" style={{ backgroundColor: currentTheme.accent }}></div>
                    <span className="text-[18px] font-mono font-black tracking-[0.3em] uppercase" style={{ color: currentTheme.accent }}>Headline Design Archive</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-12 mb-6">
                <div className="flex flex-col relative z-20 shrink-0">
                  <span className="text-[20px] font-bold tracking-[0.4em] mb-2 uppercase opacity-60">AUTHENTICATED BY</span>
                  <span contentEditable={!isExport} suppressContentEditableWarning onBlur={(e) => updateDataField('author', e.currentTarget.innerHTML)} className={`text-[56px] font-serif font-black tracking-widest underline decoration-[8px] underline-offset-[16px] outline-none w-fit`} style={{ textDecorationColor: currentTheme.accent }}>
                    {data.author}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-8 mt-2 relative">
                  <div className="flex items-center gap-6">
                    <div className="h-[3px] flex-1 rounded-full opacity-40" style={{ background: `linear-gradient(to right, ${currentTheme.accent}, transparent)` }}></div>
                    <div className="flex gap-3">
                       <div className="w-4 h-4 border-[2px] rotate-45" style={{ borderColor: currentTheme.text }}></div>
                       <div className="w-4 h-4 border-[2px] rotate-45 opacity-50" style={{ borderColor: currentTheme.text }}></div>
                    </div>
                  </div>
                  <div className="flex items-end gap-4 h-32">
                    <div className="w-6 h-full rounded-sm opacity-10" style={{ backgroundColor: currentTheme.text }}></div>
                    <div className="w-6 h-[60%] rounded-sm opacity-30" style={{ backgroundColor: currentTheme.accent }}></div>
                    <div className="w-6 h-[85%] rounded-sm" style={{ backgroundColor: currentTheme.accent }}></div>
                    <div className="w-6 h-[40%] rounded-sm opacity-50" style={{ backgroundColor: currentTheme.text }}></div>
                    <div className="w-6 h-[70%] rounded-sm opacity-20" style={{ backgroundColor: currentTheme.accent }}></div>
                    <div className="flex-1 flex flex-col items-end gap-3 pr-4 opacity-40">
                      <span className={`text-[16px] font-mono font-bold tracking-[0.2em] uppercase outline-none`}>A GRAND DEATH, OR A HOPELESS LOVE</span>
                      <div className="w-full h-[2px]" style={{ backgroundColor: currentTheme.text }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[30px] relative">
                <div className="w-full relative z-10">
                  <div className="flex gap-14 items-start">
                    <div className="flex-1 relative">
                      <div className="absolute -top-10 -left-10 text-[160px] font-serif font-black select-none pointer-events-none opacity-5" style={{ color: currentTheme.accent }}>“</div>
                      <div className="backdrop-blur-lg p-[40px] rounded-[32px] shadow-2xl border-t-[1px] border-l-[1px] relative overflow-hidden" style={{ backgroundColor: currentTheme.card, borderColor: 'rgba(255,255,255,0.2)' }}>
                        <div className="absolute -right-[30px] -bottom-[30px] pointer-events-none z-0 rotate-[12deg]">
                           <Hash size={300} strokeWidth={0.3} className="opacity-5" style={{ color: currentTheme.accent }} />
                        </div>
                        <div 
                          contentEditable={!isExport} 
                          suppressContentEditableWarning 
                          onBlur={(e) => { updateDataField('intro', e.currentTarget.innerHTML); }} 
                          className={`text-[42px] mt-2 leading-[1.6] font-serif font-medium outline-none relative z-10 tracking-tight`}
                          dangerouslySetInnerHTML={{ __html: data.intro }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="[writing-mode:vertical-lr] text-[20px] font-black tracking-[0.8em] select-none opacity-60 mb-6 uppercase" style={{ color: currentTheme.accent }}>PREFACE</div>
                      <div className="w-[1px] h-[120px] opacity-40" style={{ background: `linear-gradient(to b, ${currentTheme.accent}, transparent)` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-[20px] w-full max-w-[1240px] mx-auto mb-[10px] relative z-10 ${!isExport ? 'flex-1' : ''}`}>
        {itemsToRender.map((item) => {
          const isCategoryOpen = activePicker?.id === item.id && activePicker?.type === 'category';
          const isTypeOpen = activePicker?.id === item.id && activePicker?.type === 'type';
          
          return (
            <div key={item.id} className={`group relative flex gap-[110px] items-start transition-all duration-500 p-[40px] -mx-[40px] rounded-[70px]`}>
              <div className="flex flex-col items-end pt-[22px] min-w-[260px] relative">
                <span className="text-[120px] font-serif italic leading-none mb-[32px] font-black opacity-10" style={{ color: currentTheme.accent }}>{String(data.items.findIndex(i => i.id === item.id) + 1).padStart(2, '0')}</span>
                <span contentEditable={!isExport} suppressContentEditableWarning onBlur={(e) => updateItemField(item.id, 'date', e.currentTarget.innerText)} className={`text-[34px] font-mono font-black tracking-widest outline-none`}>{item.date}</span>
                
                <div className="relative mt-4">
                  <div 
                    onClick={(e) => { e.stopPropagation(); if (!isExport) { setActivePicker(isCategoryOpen ? null : {id: item.id, type: 'category'}); } }} 
                    className={`flex items-center justify-center px-8 py-3 rounded-full cursor-pointer transition-all ${!isExport ? 'bg-white/40 shadow-sm hover:bg-white/60' : ''}`} 
                    style={{ backgroundColor: `${currentTheme.accent}22` }}
                  >
                    <span className="text-[26px] tracking-[0.4em] font-black uppercase pl-[0.4em]" style={{ color: currentTheme.text }}>{item.category}</span>
                    {!isExport && <ChevronDown size={24} className={`ml-2 opacity-40 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />}
                  </div>
                  {!isExport && isCategoryOpen && <InlinePicker id={item.id} type="category" currentVal={item.category} />}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-[30px]">
                  <h2 contentEditable={!isExport} suppressContentEditableWarning onBlur={(e) => updateItemField(item.id, 'title', e.currentTarget.innerHTML)} className={`text-[76px] font-serif font-black leading-tight tracking-tight outline-none w-full`}>{item.title}</h2>
                  {!isExport && (
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); removeItem(item.id, e); }} className="p-5 bg-white shadow-xl text-red-500 rounded-full active:scale-90 transition-transform"><Trash2 size={36} /></button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-[35px] mb-[30px] relative">
                  <div className="h-[3px] w-[110px]" style={{ backgroundColor: currentTheme.accent }}></div>
                  <div className="relative">
                    <span 
                      onClick={(e) => { e.stopPropagation(); if (!isExport) { setActivePicker(isTypeOpen ? null : {id: item.id, type: 'type'}); } }}
                      className={`text-[34px] italic font-black uppercase opacity-60 outline-none flex items-center gap-4 cursor-pointer px-4 py-2 rounded-xl transition-all hover:bg-black/5`}
                    >
                      {item.type} 
                      {!isExport && <ChevronDown size={20} className={`opacity-30 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />}
                    </span>
                    {!isExport && isTypeOpen && <InlinePicker id={item.id} type="type" currentVal={item.type} />}
                  </div>
                </div>

                <div 
                  contentEditable={!isExport} 
                  suppressContentEditableWarning 
                  onInput={(e) => {
                    updateItemField(item.id, 'content', e.currentTarget.innerHTML);
                  }}
                  onPaste={(e) => handlePaste(item.id, 'content', e)}
                  className={`text-[44px] leading-[1.85] font-serif text-justify whitespace-pre-wrap break-words break-all outline-none w-full min-h-[1em] mb-8`}
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                <div className="flex items-start gap-12 border-t-[1px] pt-8" style={{ borderColor: `${currentTheme.text}22` }}>
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: currentTheme.accent }}>
                      <Quote size={32} color="white" />
                    </div>
                    <span className="[writing-mode:vertical-lr] text-[20px] font-mono font-black tracking-[0.2em] opacity-40 uppercase">THOUGHTS</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[28px] font-serif font-black mb-6 tracking-widest uppercase opacity-80" style={{ color: currentTheme.accent }}>{data.author}有话说 / {data.author.toUpperCase()}'S MESSAGE</h3>
                    <div 
                      contentEditable={!isExport} 
                      suppressContentEditableWarning 
                      onInput={(e) => {
                        updateItemField(item.id, 'thoughts', e.currentTarget.innerHTML);
                      }}
                      onPaste={(e) => handlePaste(item.id, 'thoughts', e)}
                      className="text-[40px] leading-[1.8] font-serif font-light italic break-words break-all outline-none w-full whitespace-pre-wrap opacity-90 min-h-[1em]"
                      dangerouslySetInnerHTML={{ __html: item.thoughts }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`relative z-10 shrink-0 ${!isExport ? 'mt-auto' : 'mt-[5px]'}`}>
        <div className="w-full h-[4px] mb-[20px] flex gap-4">
           <div className="flex-1 h-full rounded-full" style={{ backgroundColor: `${currentTheme.text}1A` }}></div>
           <div className="w-20 h-full rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-8 flex flex-col gap-4 justify-center">
            <span className="text-[42px] font-serif font-black tracking-[0.2em] leading-none">年度作品 PROJECT</span>
            <span className="text-[22px] font-mono font-bold opacity-80 uppercase tracking-[0.6em] font-black leading-none">ALL RIGHTS RESERVED.</span>
          </div>
          <div className="col-span-4 flex flex-col items-end gap-4 text-right">
             <span className="text-[20px] font-mono font-black tracking-widest uppercase opacity-40 leading-none">STATUS: LOGGED / MASTERPIECE</span>
             <div className="h-[2px] w-[220px]" style={{ background: `linear-gradient(to right, transparent, ${currentTheme.accent})` }}></div>
             <span className="text-[40px] font-serif font-black tracking-tight leading-none">© {data.year} <span style={{ color: currentTheme.accent }}>{data.author}</span></span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleGlobalClick = () => {
    setActivePicker(null); 
    setShowExportMenu(false); 
    setShowThemePicker(false);
    setShowConfig(false);
    setShowTagManager(false);
    setShowFontSizeSlider(false);
    setShowColorPicker(false);
  };

  return (
    <div className="fixed inset-0 bg-[#E8E4DF] flex flex-col overflow-hidden" onClick={handleGlobalClick}>
      
      {isExporting && (
        <div className="fixed top-[-10000px] left-[-10000px] pointer-events-none opacity-0">
          <SummaryCanvas itemsToRender={renderingItems} isExport={true} />
        </div>
      )}

      <main ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth overflow-x-hidden">
        <div style={{ width: '100%', height: `${canvasRealHeight * scale}px`, position: 'relative' }}>
          <div style={{ width: '1440px', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
            <SummaryCanvas itemsToRender={data.items} />
          </div>
        </div>
        <div className="h-[30px] pointer-events-none" />
      </main>

      {showScrollTop && (
        <button onClick={(e) => { e.stopPropagation(); scrollToTop(); }} className="fixed bottom-32 right-6 w-14 h-14 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/5 z-[60] animate-in fade-in zoom-in duration-300 active:scale-90 hover:bg-white/80" style={{ color: currentTheme.accent }}>
          <ArrowUp size={28} />
        </button>
      )}

      <div className="relative z-[250] bg-white/80 backdrop-blur-xl border-t border-black/5 flex flex-col animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
        
        <div className="px-4 py-2 flex flex-col gap-2 relative border-b border-black/5">
          {showFontSizeSlider && (
            <div 
              className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[20px] p-3 px-5 shadow-xl border border-white animate-in slide-in-from-bottom-2"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 py-1">
                <span className="text-[12px] font-black text-black/60 min-w-[24px] text-center font-mono">{currentFontSize}</span>
                <div className="flex-1 relative pt-1">
                  <input 
                    type="range" 
                    min="12" 
                    max="80" 
                    step="1"
                    value={currentFontSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCurrentFontSize(val);
                      applyStyle('fontSize', val.toString());
                    }}
                    className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-black cursor-pointer relative z-10"
                  />
                </div>
              </div>
            </div>
          )}

          {showColorPicker && (
            <div 
              className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[20px] p-2 px-4 shadow-xl border border-white animate-in slide-in-from-bottom-2"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1.5 px-0.5">
                {COLOR_PRESETS.map((color) => (
                  <button 
                    key={color}
                    onClick={() => {
                      applyStyle('foreColor', color);
                      setShowColorPicker(false);
                    }}
                    className="w-8 h-8 rounded-full shrink-0 shadow-inner border border-black/5 transition-transform active:scale-90 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {color === '#FFFFFF' && <div className="w-1/2 h-[1px] bg-gray-100 rotate-45"></div>}
                  </button>
                ))}
                <button 
                  onClick={() => {
                    applyStyle('foreColor', currentTheme.accent);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded-full shrink-0 shadow-inner border border-black/5 transition-transform active:scale-90 flex flex-col items-center justify-center gap-0 overflow-hidden bg-gray-50"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
                  <span className="text-[5px] font-black uppercase opacity-60">主题</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {toolbarMode === 'normal' ? (
              <div className="flex items-center gap-1 w-full flex-nowrap overflow-x-auto no-scrollbar">
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyLeft'); }} className="p-2.5 hover:bg-black/5 rounded-2xl transition-colors shrink-0"><AlignLeft size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyCenter'); }} className="p-2.5 hover:bg-black/5 rounded-2xl transition-colors shrink-0"><AlignCenter size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyRight'); }} className="p-2.5 hover:bg-black/5 rounded-2xl transition-colors shrink-0"><AlignRight size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyFull'); }} className="p-2.5 hover:bg-black/5 rounded-2xl transition-colors shrink-0"><AlignJustify size={20} /></button>
                <div className="w-[1px] h-6 bg-black/5 mx-1 shrink-0"></div>
                <button 
                  onMouseDown={(e) => { e.preventDefault(); setShowFontSizeSlider(!showFontSizeSlider); setShowColorPicker(false); }} 
                  className={`p-2.5 rounded-2xl transition-colors flex items-center gap-1 shrink-0 ${showFontSizeSlider ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                >
                  <Type size={20} />
                </button>
                <div className="w-[1px] h-6 bg-black/5 mx-1 shrink-0"></div>
                <button 
                  onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); setShowFontSizeSlider(false); }} 
                  className={`p-2.5 rounded-2xl transition-colors shrink-0 ${showColorPicker ? 'bg-black/10' : 'hover:bg-black/5'}`}
                >
                  <Palette size={20} style={{ color: currentTheme.accent }} />
                </button>
                <div className="flex-1"></div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setToolbarMode('batch'); setShowFontSizeSlider(false); setShowColorPicker(false); }} 
                  className="p-2.5 bg-black/5 hover:bg-black/10 rounded-2xl transition-colors flex items-center gap-2 shrink-0"
                >
                  <Search size={18} />
                  <span className="text-[10px] font-black uppercase">批量</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full flex-nowrap animate-in fade-in duration-300">
                <div className="flex-1 relative min-w-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={batchSearchTerm} 
                    onChange={e => setBatchSearchTerm(e.target.value)}
                    placeholder="搜索关键词进行批量对齐..." 
                    className="w-full bg-black/5 rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-bold outline-none focus:bg-white border border-transparent focus:border-black/10 transition-all"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-center gap-0.5 shrink-0 bg-black/5 p-1 rounded-xl">
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('left'); }} className="p-2 hover:bg-black/10 rounded-lg transition-colors"><AlignLeft size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('center'); }} className="p-2 hover:bg-black/10 rounded-lg transition-colors"><AlignCenter size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('right'); }} className="p-2 hover:bg-black/10 rounded-lg transition-colors"><AlignRight size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setToolbarMode('normal'); }} className="p-2 ml-1 bg-black text-white rounded-lg active:scale-90 transition-transform"><Check size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="h-14 flex items-center justify-around px-4 safe-area-bottom shrink-0">
          <div className="relative">
            {showConfig && (
              <div className="absolute bottom-[110%] left-[0px] mb-5 w-[calc(100vw-32px)] max-w-72 bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-white/60 p-6 animate-in slide-in-from-bottom-3 fade-in duration-300 z-[300]" onClick={e => e.stopPropagation()}>
                <div className="space-y-5">
                  <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2 mb-2">
                    <Settings2 size={16} /> 全书设定
                  </h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">主标题</label>
                    <input value={data.mainTitle} onChange={e => setData({...data, mainTitle: e.target.value})} className="w-full bg-black/5 px-4 py-3 rounded-2xl text-xs font-serif font-black outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">年份</label>
                      <input value={data.year} onChange={e => setData({...data, year: e.target.value})} className="w-full bg-black/5 px-4 py-3 rounded-2xl text-xs font-mono font-black outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">作者</label>
                      <input value={data.author} onChange={e => setData({...data, author: e.target.value})} className="w-full bg-black/5 px-4 py-3 rounded-2xl text-xs font-black outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">总结类型</label>
                    <input value={data.summaryType} onChange={e => setData({...data, summaryType: e.target.value})} className="w-full bg-black/5 px-4 py-3 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                  </div>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowConfig(!showConfig); setShowTagManager(false); setShowThemePicker(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showConfig ? 'text-black' : 'text-black/40'} active:scale-100`}>
              <Settings2 size={20} />
              <span className="text-[10px] font-bold">设定</span>
            </button>
          </div>

          <div className="relative">
            {showTagManager && (
              <div className="absolute bottom-[110%] left-[-20px] mb-5 w-[calc(100vw-32px)] max-w-72 bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-white/60 p-6 animate-in slide-in-from-bottom-3 fade-in duration-300 z-[300] max-h-[420px] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2 mb-2">
                    <Tags size={16} /> 标签管理
                  </h3>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">分类目录</label>
                    <div className="flex flex-wrap gap-2">
                      {data.savedCategories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-black/5 px-3 py-1.5 rounded-full text-[10px] font-black">
                          {cat}
                          <button onClick={() => setData(prev => ({...prev, savedCategories: prev.savedCategories.filter(c => c !== cat)}))} className="text-gray-400 hover:text-red-500 transition-colors"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} placeholder="输入新分类..." className="flex-1 bg-black/5 rounded-2xl px-4 py-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                      <button onClick={addCategory} className="bg-black text-white px-3 rounded-2xl active:scale-90 transition-transform"><Plus size={16} /></button>
                    </div>
                  </div>
                  <div className="h-[1px] bg-black/5" />
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">副标题标记</label>
                    <div className="flex flex-wrap gap-2">
                      {data.savedTypes.map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-black/5 px-3 py-1.5 rounded-full text-[10px] font-black italic">
                          {t}
                          <button onClick={() => setData(prev => ({...prev, savedTypes: prev.savedTypes.filter(st => st !== t)}))} className="text-gray-400 hover:text-red-500 transition-colors not-italic"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newTypeInput} onChange={e => setNewTypeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addType()} placeholder="输入新标记..." className="flex-1 bg-black/5 rounded-2xl px-4 py-3 text-[10px] font-bold italic outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                      <button onClick={addType} className="bg-black text-white px-3 rounded-2xl active:scale-90 transition-transform"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowTagManager(!showTagManager); setShowConfig(false); setShowThemePicker(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showTagManager ? 'text-black' : 'text-black/40'} active:scale-100`}>
              <Tags size={20} />
              <span className="text-[10px] font-bold">标签</span>
            </button>
          </div>

          <button onClick={(e) => { e.stopPropagation(); addNewItem(); }} className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white active:scale-100 shadow-xl shrink-0">
            <Plus size={20} strokeWidth={3} />
          </button>

          <div className="relative">
            {showThemePicker && (
              <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-5 w-36 bg-white/95 backdrop-blur-3xl rounded-[24px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-white/60 p-2 animate-in slide-in-from-bottom-3 fade-in duration-300 z-[300]" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col gap-1.5">
                  {THEMES.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => { setData({...data, themeId: t.id}); setShowThemePicker(false); }} 
                      className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${data.themeId === t.id ? 'bg-black/5' : 'hover:bg-black/[0.03]'}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-black/5 shadow-inner shrink-0" style={{ backgroundColor: t.accent }}></div>
                      <span className={`text-[11px] font-black whitespace-nowrap ${data.themeId === t.id ? 'text-black' : 'text-gray-400'}`}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowThemePicker(!showThemePicker); setShowConfig(false); setShowTagManager(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showThemePicker ? 'text-black' : 'text-black/40'} active:scale-100`}>
              <Palette size={20} />
              <span className="text-[10px] font-bold">主题</span>
            </button>
          </div>
          
          <div className="relative">
            {showExportMenu && (
              <div className="absolute bottom-[110%] right-[0px] mb-5 w-24 bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-white/60 p-1.5 animate-in slide-in-from-bottom-3 fade-in duration-300 z-[300]" onClick={e => e.stopPropagation()}>
                {exportSubMode === 'main' ? (
                  <div className="flex flex-col gap-1">
                    <button onClick={handleExportLong} className="flex flex-col items-center gap-1 p-2.5 hover:bg-black/5 rounded-2xl transition-all group border-b border-black/5 pb-2.5">
                      <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center group-active:scale-90 transition-transform">
                        <Layers size={16} />
                      </div>
                      <span className="font-black text-[8px] uppercase tracking-tighter text-gray-800 text-center">完整长图</span>
                    </button>
                    <button onClick={() => setExportSubMode('select')} className="flex flex-col items-center gap-1 p-2.5 hover:bg-black/5 rounded-2xl transition-all group border-b border-black/5 pb-2.5">
                      <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center group-active:scale-90 transition-transform">
                        <CheckSquare size={16} />
                      </div>
                      <span className="font-black text-[8px] uppercase tracking-tighter text-gray-800 text-center">勾选导出</span>
                    </button>
                    <button onClick={handleExportAllPages} className="flex flex-col items-center gap-1 p-2.5 hover:bg-black/5 rounded-2xl transition-all group">
                      <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center group-active:scale-90 transition-transform">
                        <FileText size={16} />
                      </div>
                      <span className="font-black text-[8px] uppercase tracking-tighter text-gray-800 text-center">批量单页</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-1 flex flex-col gap-3 min-h-[260px]">
                    <div className="flex items-center justify-between px-1 mt-1">
                      <button onClick={() => setExportSubMode('main')} className="text-gray-400"><ChevronLeft size={14} /></button>
                      <span className="text-[8px] font-black text-black">({selectedItemIds.length})</span>
                      <button onClick={() => setSelectedItemIds(selectedItemIds.length === data.items.length ? [] : data.items.map(i => i.id))} className="text-[7px] font-black uppercase underline">全选</button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 overflow-y-auto no-scrollbar max-h-40 py-1">
                      {data.items.map((item, i) => {
                        const isSelected = selectedItemIds.includes(item.id);
                        return (
                          <button key={item.id} onClick={() => toggleItemSelection(item.id)} className={`h-8 rounded-lg font-mono font-black text-[8px] transition-all border ${isSelected ? 'bg-black border-black text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            {String(i + 1).padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={handleExportSelectedPreview} className="w-full bg-black text-white py-3 rounded-lg font-black text-[8px] tracking-widest uppercase flex items-center justify-center gap-1 active:scale-95 transition-transform mt-auto mb-1">
                      导出 <ArrowRight size={8} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); if(!showExportMenu) { setExportSubMode('main'); setSelectedItemIds([]); } setShowThemePicker(false); setShowConfig(false); setShowTagManager(false); }} disabled={isExporting} className={`flex flex-col items-center gap-0.5 transition-colors ${showExportMenu ? 'text-black' : 'text-black/40'} active:scale-100`}>
              {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              <span className="text-[10px] font-bold">发布</span>
            </button>
          </div>
        </footer>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[32px] flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in duration-300">
             <Loader2 size={40} className="animate-spin text-black" />
             <div className="text-center">
               <p className="text-lg font-black mb-1">正在渲染...</p>
               <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-black transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
               </div>
               <p className="text-[10px] text-gray-400 mt-2">处理高清长图可能需要一点时间</p>
             </div>
           </div>
        </div>
      )}

      {isPreviewing && previewUrls.length > 0 && (
        <div className="fixed inset-0 z-[600] flex flex-col" style={{ backgroundColor: currentTheme.bg }}>
          <div className="h-16 flex items-center justify-between px-6 bg-white/40 backdrop-blur-2xl shrink-0 border-b border-black/5">
            <button onClick={() => setIsPreviewing(false)} className="font-bold flex items-center gap-2" style={{ color: currentTheme.text }}><ChevronLeft size={20} /> 返回</button>
            <div className="flex gap-2">
              <span className="bg-black/5 px-4 py-2 rounded-full text-[10px] font-black" style={{ color: currentTheme.text }}>{previewUrls.length} 页已就绪</span>
              <button 
                onClick={() => {
                  previewUrls.forEach((url, i) => {
                    const link = document.createElement('a');
                    link.download = `年度记录_${data.year}_${i+1}.png`;
                    link.href = url;
                    link.click();
                  });
                }} 
                className="text-white px-5 py-2 rounded-full font-black text-[11px] shadow-lg active:scale-95 transition-transform" 
                style={{ backgroundColor: currentTheme.accent }}
              >
                保存全部
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-12 pb-32">
            {previewUrls.map((url, i) => (
              <div key={i} className="w-full max-w-[1440px] mx-auto shadow-2xl rounded-[40px] overflow-hidden bg-white/20 border border-white/20">
                <img src={url} alt={`PREVIEW ${i}`} className="w-full h-auto block" style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
