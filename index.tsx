
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
  Tags,
  Layout,
  PlusSquare,
  MinusSquare
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface SummaryItem {
  id: string;
  title: string;
  date: string;
  category: string;
  type: string;
  contents: string[];
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

const TEXTURE_URL = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3dyZlZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZidmZiZ6Np9LAAAAFnRSTlMAp79vj6uXm59/f39/f39/f39/f39/f398C9mBAAAAelURBVDjL7ZFBCsAwDMNisv//766mS7vtoYORXAiBhC8m8mIyLybyYiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJiIvJvJi8m/mBfNNCFmS0XyXAAAAAElFTkSuQmCC")`;

const DEFAULT_TEXT = '';
const GET_CURRENT_DATE = () => new Date().getFullYear().toString();
const STORAGE_KEY = 'year_end_summary_app_v2';

// 新增：解决光标问题的组件
const EditableArea = ({ html, onChange, className, tag: Tag = 'div', isExport = false, onPaste, ...props }: any) => {
  const elRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 仅在初始挂载或当前元素没有焦点时更新 innerHTML，防止 React 重新协调导致的丢焦点
    if (elRef.current && (isInitialMount.current || document.activeElement !== elRef.current)) {
      elRef.current.innerHTML = html || '';
      isInitialMount.current = false;
    }
  }, [html]);

  if (isExport) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} {...props} />;
  }

  return (
    <Tag
      ref={elRef as any}
      contentEditable={true}
      suppressContentEditableWarning
      className={`${className} outline-none`}
      onInput={(e: React.FormEvent<HTMLElement>) => onChange(e.currentTarget.innerHTML)}
      onPaste={onPaste}
      {...props}
    />
  );
};

const InlinePicker = ({ 
  id, 
  type, 
  currentVal, 
  savedCategories, 
  savedTypes, 
  currentTheme, 
  updateItemField, 
  setActivePicker, 
  setShowTagManager 
}: { 
  id: string, 
  type: 'category' | 'type', 
  currentVal: string,
  savedCategories: string[],
  savedTypes: string[],
  currentTheme: ThemeConfig,
  updateItemField: (id: string, field: keyof SummaryItem, value: any) => void,
  setActivePicker: (val: {id: string, type: 'category' | 'type'} | null) => void,
  setShowTagManager: (val: boolean) => void
}) => {
  const list = type === 'category' ? savedCategories : savedTypes;
  return (
    <div className="absolute top-[calc(100%+20px)] left-0 z-[100] w-[300px] bg-white/95 backdrop-blur-3xl rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] border border-white/80 p-3 animate-in fade-in zoom-in slide-in-from-top-3 duration-500 origin-top-left" onClick={e => e.stopPropagation()}>
      <div className="px-4 pt-4 pb-3 border-b border-black/[0.04] mb-2 flex justify-between items-center">
        <span className="text-[16px] font-black tracking-[0.15em] opacity-40 uppercase">{type === 'category' ? 'Category' : 'Work Type'}</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full opacity-20" style={{ backgroundColor: currentTheme.accent }}></div>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>
      </div>
      <div className="max-h-[380px] overflow-y-auto no-scrollbar py-0.5">
        {list.length > 0 ? list.map((val, i) => (
          <button 
            key={i} 
            onClick={() => {
              updateItemField(id, type, val);
              setActivePicker(null);
            }}
            className={`w-full group relative flex items-center px-4 py-4 rounded-[18px] transition-all duration-300 ${val === currentVal ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02] active:scale-[0.99]'}`}
          >
            <span className="text-[22px] font-mono font-black opacity-15 mr-5 group-hover:opacity-30 transition-opacity w-6 shrink-0 text-center">{String(i + 1).padStart(2, '0')}</span>
            <span className={`flex-1 text-[32px] font-black leading-tight tracking-tight break-all text-left ${type === 'type' ? 'italic font-serif' : ''}`} style={{ color: val === currentVal ? currentTheme.accent : 'inherit' }}>{val}</span>
            {val === currentVal && (
              <div className="ml-2 w-3 h-3 shrink-0 rounded-full shadow-[0_0_12px]" style={{ backgroundColor: currentTheme.accent, boxShadow: `0 0 12px ${currentTheme.accent}55` }}></div>
            )}
          </button>
        )) : (
          <div className="py-10 px-4 text-center flex flex-col items-center gap-5">
            <PlusCircle size={32} className="text-black/10" />
            <p className="text-[16px] font-black text-black/20 italic tracking-widest uppercase">Null Archive</p>
            <button onClick={() => { setActivePicker(null); setShowTagManager(true); }} className="text-[13px] font-black tracking-[0.1em] text-black/50 hover:text-black transition-colors border-b-2 border-black/10 pb-0.5">Init Library</button>
          </div>
        )}
      </div>
      <div className="mt-1 p-2 bg-black/[0.01] rounded-b-[24px] flex justify-center">
         <div className="w-10 h-1 rounded-full bg-black/5"></div>
      </div>
    </div>
  );
};

const SummaryCanvas = ({ 
  data, 
  currentTheme, 
  itemsToRender, 
  isExport = false, 
  canvasRef, 
  exportContainerRef,
  updateDataField,
  updateItemField,
  removeItem,
  activePicker,
  setActivePicker,
  handlePaste,
  setShowTagManager,
  addContentBlock,
  removeContentBlock,
  updateContentBlock
}: { 
  data: SummaryData, 
  currentTheme: ThemeConfig, 
  itemsToRender: SummaryItem[], 
  isExport?: boolean,
  canvasRef?: React.RefObject<HTMLDivElement | null>,
  exportContainerRef?: React.RefObject<HTMLDivElement | null>,
  updateDataField: (field: keyof Omit<SummaryData, 'items' | 'savedCategories' | 'savedTypes'>, value: string) => void,
  updateItemField: (id: string, field: keyof SummaryItem, value: any) => void,
  removeItem: (id: string, e: React.MouseEvent) => void,
  activePicker: {id: string, type: 'category' | 'type'} | null,
  setActivePicker: (val: {id: string, type: 'category' | 'type'} | null) => void,
  handlePaste: (id: string, index: number | null, field: keyof SummaryItem, e: React.ClipboardEvent) => void,
  setShowTagManager: (val: boolean) => void,
  addContentBlock: (itemId: string) => void,
  removeContentBlock: (itemId: string, index: number) => void,
  updateContentBlock: (itemId: string, index: number, value: string) => void
}) => (
  <div 
    ref={isExport ? exportContainerRef : canvasRef}
    style={{ 
      width: '1440px',
      backgroundColor: currentTheme.bg,
      minHeight: isExport ? 'auto' : '2560px',
      paddingBottom: '30px',
      transition: 'none'
    }}
    className={`text-[${currentTheme.text}] pt-[20px] px-[100px] flex flex-col relative overflow-hidden`}
  >
    <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: TEXTURE_URL, backgroundSize: '64px 64px' }}></div>
    
    <div className="w-full flex flex-col mb-[20px] relative z-10 shrink-0">
      <div className="flex justify-between items-end border-b-[4px] border-current pb-8 mb-[60px]" style={{ color: currentTheme.text }}>
        <div className="flex flex-col">
          <EditableArea 
            tag="span"
            isExport={isExport} 
            html={data.summaryType}
            onChange={(val: string) => updateDataField('summaryType', val)}
            className="font-serif text-[32px] tracking-[0.2em] font-black min-w-[200px]"
          />
        </div>
        <div className="text-right">
          <span className="font-mono text-[22px] tracking-[0.3em] font-bold block uppercase opacity-60">ISSUE NO. {data.year.slice(-2)}</span>
          <span className="font-mono text-[22px] tracking-[0.3em] font-bold uppercase whitespace-nowrap opacity-60">ARCHIVE INDEX 001</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-[40px] items-start">
        <div className="col-span-1 flex flex-col items-center pt-8">
           <div className="rotate-180 [writing-mode:vertical-lr] font-serif text-[130px] font-black leading-none tracking-widest select-none opacity-20">{data.year}</div>
           <div className="w-[4px] h-[300px] mt-8 opacity-20" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>

        <div className="col-span-11 pl-10 relative">
          <div className="absolute -left-[40px] top-[40px] w-[80px] h-[8px]" style={{ backgroundColor: currentTheme.accent }}></div>
          <div className="relative mb-4">
            <div className="flex items-end mb-4">
              <div className="flex-1 relative">
                <span className="absolute -top-[35px] left-2 text-[20px] font-mono font-bold tracking-[0.8em] uppercase opacity-40">Yearly Chronicle</span>
                <div className="absolute -left-6 top-8 w-40 h-40 rounded-full -z-10 opacity-10" style={{ backgroundColor: currentTheme.accent }}></div>
                <EditableArea 
                  tag="h1"
                  isExport={isExport}
                  html={data.mainTitle}
                  onChange={(val: string) => updateDataField('mainTitle', val)}
                  className="text-[170px] font-serif font-black leading-[1.1] tracking-tighter relative min-h-[1em] inline-block"
                  style={{ backgroundImage: `linear-gradient(to right, ${currentTheme.text} 55%, ${currentTheme.accent} 55%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                />
                <div className="flex items-center gap-4 mt-[-15px] mb-8">
                  <div className="h-[2px] w-20" style={{ backgroundColor: currentTheme.accent }}></div>
                  <span className="text-[18px] font-mono font-black tracking-[0.3em] uppercase" style={{ color: currentTheme.accent }}>Headline Design Archive</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-12 mb-6">
              <div className="flex flex-col relative z-20 shrink-0">
                <span className="text-[20px] font-bold tracking-[0.4em] mb-2 uppercase opacity-60">AUTHENTICATED BY</span>
                <EditableArea 
                  tag="span"
                  isExport={isExport}
                  html={data.author}
                  onChange={(val: string) => updateDataField('author', val)}
                  className="text-[56px] font-serif font-black tracking-widest underline decoration-[8px] underline-offset-[16px] w-fit min-w-[100px]"
                  style={{ textDecorationColor: currentTheme.accent }}
                />
              </div>
              <div className="flex-1 flex-col gap-8 mt-2 relative hidden"> {/* Reserved for layout consistency if needed */} </div>
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
                      <EditableArea 
                        isExport={isExport}
                        html={data.intro}
                        onChange={(val: string) => updateDataField('intro', val)}
                        className="text-[42px] mt-2 leading-[1.6] font-serif font-medium relative z-10 tracking-tight min-h-[2em]"
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
              <EditableArea 
                tag="span"
                isExport={isExport}
                html={item.date}
                onChange={(val: string) => updateItemField(item.id, 'date', val)}
                className="text-[34px] font-mono font-black tracking-widest min-w-[100px] text-right"
              />
              
              <div className="relative mt-4">
                <div 
                  onClick={(e) => { e.stopPropagation(); if (!isExport) { setActivePicker(isCategoryOpen ? null : {id: item.id, type: 'category'}); } }} 
                  className={`flex items-center justify-center px-8 py-3 rounded-full cursor-pointer transition-all ${!isExport ? 'bg-white/40 shadow-sm hover:bg-white/60' : ''}`} 
                  style={{ backgroundColor: `${currentTheme.accent}22` }}
                >
                  <span className="text-[26px] tracking-[0.4em] font-black uppercase pl-[0.4em]" style={{ color: currentTheme.text }}>{item.category}</span>
                  {!isExport && <ChevronDown size={24} className={`ml-2 opacity-40 transition-transform ${isCategoryOpen ? 'rotate-180' : 'rotate-0'}`} />}
                </div>
                {!isExport && isCategoryOpen && (
                  <InlinePicker 
                    id={item.id} 
                    type="category" 
                    currentVal={item.category}
                    savedCategories={data.savedCategories}
                    savedTypes={data.savedTypes}
                    currentTheme={currentTheme}
                    updateItemField={updateItemField}
                    setActivePicker={setActivePicker}
                    setShowTagManager={setShowTagManager}
                  />
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-[30px]">
                <EditableArea 
                  tag="h2"
                  isExport={isExport}
                  html={item.title}
                  onChange={(val: string) => updateItemField(item.id, 'title', val)}
                  className="text-[76px] font-serif font-black leading-tight tracking-tight w-full min-h-[1em]"
                />
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
                    className={`text-[34px] italic font-black uppercase opacity-60 flex items-center gap-4 cursor-pointer px-4 py-2 rounded-xl transition-all hover:bg-black/5`}
                  >
                    {item.type} 
                    {!isExport && <ChevronDown size={20} className={`opacity-30 transition-transform ${isTypeOpen ? 'rotate-180' : 'rotate-0'}`} />}
                  </span>
                  {!isExport && isTypeOpen && (
                    <InlinePicker 
                      id={item.id} 
                      type="type" 
                      currentVal={item.type}
                      savedCategories={data.savedCategories}
                      savedTypes={data.savedTypes}
                      currentTheme={currentTheme}
                      updateItemField={updateItemField}
                      setActivePicker={setActivePicker}
                      setShowTagManager={setShowTagManager}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col mb-8 relative">
                {item.contents.map((c, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`${idx === 0 ? 'mt-14 mb-4' : 'mt-20 mb-10'} relative flex items-center justify-start pr-20 group/divider`}>
                      <div className="w-1.5 h-32 shrink-0 rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
                      <div className="h-[1px] flex-1 ml-10" style={{ backgroundColor: `${currentTheme.text}20` }}></div>
                      <div className="absolute left-6 -top-14 flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] font-mono font-black tracking-[0.8em] uppercase opacity-25 select-none">Record Part</span>
                          <div className="h-[1px] w-20 opacity-10" style={{ backgroundColor: currentTheme.text }}></div>
                        </div>
                        <div className="flex items-baseline gap-4">
                          <span className="text-[42px] font-serif font-black italic tracking-tighter" style={{ color: currentTheme.accent }}>PART.</span>
                          <span className="text-[72px] font-mono font-black leading-none tracking-tight opacity-10">{String(idx + 1).padStart(2, '0')}</span>
                          <div className="flex flex-col gap-1 ml-4 opacity-40">
                            <span className="text-[12px] font-mono font-bold tracking-widest uppercase">Section Log</span>
                            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-12 flex items-center gap-3">
                         <div className="w-3 h-3 border-2 border-current rotate-45 opacity-20"></div>
                         <div className="w-3 h-3 rounded-full bg-current opacity-10"></div>
                         <div className="w-3 h-3 rounded-full bg-current opacity-5"></div>
                      </div>
                      <div className="absolute right-0 -bottom-10 opacity-[0.03] select-none pointer-events-none">
                        <span className="text-[120px] font-mono font-black uppercase tracking-tighter">DATA ARCHIVE</span>
                      </div>
                    </div>
                    
                    <div className="relative group/block">
                      <EditableArea 
                        isExport={isExport}
                        html={c}
                        onChange={(val: string) => updateContentBlock(item.id, idx, val)}
                        onPaste={(e: any) => handlePaste(item.id, idx, 'contents', e)}
                        className="text-[44px] leading-[1.85] font-serif whitespace-pre-wrap break-words break-all w-full min-h-[1.5em]"
                      />
                      {!isExport && item.contents.length > 1 && (
                        <button 
                          onClick={() => removeContentBlock(item.id, idx)}
                          className="absolute -left-12 top-2 opacity-0 group-hover/block:opacity-40 hover:opacity-100 transition-opacity p-2 text-red-400"
                        >
                          <MinusSquare size={24} />
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                ))}
                {!isExport && (
                   <button 
                    onClick={() => addContentBlock(item.id)}
                    className="mt-12 flex items-center gap-3 py-4 px-6 border-2 border-dashed border-black/10 rounded-3xl opacity-30 hover:opacity-100 transition-all text-[24px] font-black uppercase tracking-widest"
                    style={{ color: currentTheme.accent }}
                   >
                     <PlusSquare size={28} />
                     Add Content Block
                   </button>
                )}
              </div>

              <div className="flex items-start gap-12 border-t-[1px] pt-8" style={{ borderColor: `${currentTheme.text}22` }}>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: currentTheme.accent }}>
                    <Quote size={32} color="white" />
                  </div>
                  <span className="[writing-mode:vertical-lr] text-[20px] font-mono font-black tracking-[0.2em] opacity-40 uppercase">THOUGHTS</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[28px] font-serif font-black mb-6 tracking-widest uppercase opacity-80" style={{ color: currentTheme.accent }}>{data.author}有话说 / {data.author.toUpperCase()}'S MESSAGE</h3>
                  <EditableArea 
                    isExport={isExport}
                    html={item.thoughts}
                    onChange={(val: string) => updateItemField(item.id, 'thoughts', val)}
                    onPaste={(e: any) => handlePaste(item.id, null, 'thoughts', e)}
                    className="text-[40px] leading-[1.8] font-serif font-light italic break-words break-all w-full whitespace-pre-wrap opacity-90 min-h-[2em]"
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

const App = () => {
  const [data, setData] = useState<SummaryData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.items = parsed.items.map((item: any) => ({
          ...item,
          contents: item.contents || [item.content || DEFAULT_TEXT]
        }));
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    return {
      mainTitle: '衔书又止',
      author: '琉璃',
      year: new Date().getFullYear().toString(),
      wordCount: '0',
      intro: '人类总喜欢给万物下定义，好像不说清楚我是谁、你是什么，第二天太阳就不会升起来一样',
      summaryType: '彩云易散琉璃脆',
      themeId: 'rose',
      savedCategories: ['文稿'],
      savedTypes: ['游戏掉落鉴', '段子体', '人生四格', '常稿', '短打', '猫塑', '黄油鉴', '结局鉴'],
      items: [
        {
          id: 'init-1',
          title: '',
          date: GET_CURRENT_DATE(),
          category: '文稿',
          type: '无',
          contents: [DEFAULT_TEXT],
          thoughts: DEFAULT_TEXT
        }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const [showConfig, setShowConfig] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSubMode, setExportSubMode] = useState<'main' | 'select' | 'all'>('main');
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
  const [currentAlignment, setCurrentAlignment] = useState<string>('left');

  const currentTheme = THEMES.find(t => t.id === data.themeId) || THEMES[0];
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const [renderingItems, setRenderingItems] = useState<SummaryItem[]>([]);

  useEffect(() => {
    const handleSelectionChange = () => {
      let newAlign = 'left';
      if (document.queryCommandState('justifyCenter')) newAlign = 'center';
      else if (document.queryCommandState('justifyRight')) newAlign = 'right';
      else if (document.queryCommandState('justifyFull')) newAlign = 'justify';
      
      if (newAlign !== currentAlignment) {
        setCurrentAlignment(newAlign);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [currentAlignment]);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const targetWidth = 1440;
      setScale(width / targetWidth);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (document.activeElement?.hasAttribute('contenteditable')) return;
      for (let entry of entries) {
        setCanvasRealHeight(entry.target.scrollHeight);
      }
    });
    resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, [data.items, data.intro]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 400);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addNewItem = () => {
    const newItem: SummaryItem = {
      id: Date.now().toString(),
      title: DEFAULT_TEXT,
      date: GET_CURRENT_DATE(),
      category: data.savedCategories[0] || '未分类',
      type: data.savedTypes[0] || '无',
      contents: [DEFAULT_TEXT],
      thoughts: DEFAULT_TEXT
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateDataField = (field: keyof Omit<SummaryData, 'items' | 'savedCategories' | 'savedTypes'>, value: string) => {
    setData(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  };

  const updateItemField = (id: string, field: keyof SummaryItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addContentBlock = (itemId: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, contents: [...item.contents, DEFAULT_TEXT] } 
          : item
      )
    }));
  };

  const removeContentBlock = (itemId: string, index: number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, contents: item.contents.filter((_, i) => i !== index) } 
          : item
      )
    }));
  };

  const updateContentBlock = (itemId: string, index: number, value: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, contents: item.contents.map((c, i) => i === index ? value : c) } 
          : item
      )
    }));
  };

  const handlePaste = (id: string, index: number | null, field: keyof SummaryItem, e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    document.execCommand('insertText', false, text);
    const target = e.currentTarget as HTMLElement;
    if (field === 'contents' && index !== null) {
      updateContentBlock(id, index, target.innerHTML);
    } else {
      updateItemField(id, field, target.innerHTML);
    }
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
    document.execCommand(command, false, value || undefined);
    
    const active = document.activeElement as HTMLElement;
    if (active && active.hasAttribute('contenteditable')) {
      const event = new Event('input', { bubbles: true });
      active.dispatchEvent(event);
    }
    
    if (command === 'fontSize' && value) {
      document.execCommand('styleWithCSS', false, 'true');
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
          contents: item.contents.map(c => processHtml(c)),
          thoughts: processHtml(item.thoughts)
        };
      });
      return { ...prev, items: newItems };
    });
  };

  const captureNode = async (node: HTMLElement): Promise<string | null> => {
    try {
      void node.offsetHeight;
      const captureOptions = {
        width: 1440,
        height: node.scrollHeight,
        pixelRatio: 1,
        cacheBust: true,
        useCORS: true,
        includeQueryParams: true,
        filter: (el: HTMLElement) => el.tagName !== 'LINK' || !!el.getAttribute('href'),
        style: { transform: 'none', visibility: 'visible', opacity: '1' }
      };
      try {
        const blob = await htmlToImage.toBlob(node, captureOptions);
        return blob ? URL.createObjectURL(blob) : null;
      } catch (err) {
        const blob = await htmlToImage.toBlob(node, { ...captureOptions, skipFonts: true, fontEmbedCSS: '' });
        return blob ? URL.createObjectURL(blob) : null;
      }
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (!isExporting || renderingItems.length === 0) return;
    const performCapture = async () => {
      await new Promise(r => setTimeout(r, 1500));
      const node = exportContainerRef.current;
      if (!node) {
        setIsExporting(false);
        setRenderingItems([]);
        return;
      }
      if (exportSubMode === 'main') {
        const url = await captureNode(node);
        if (url) {
          setPreviewUrls([url]);
          setIsPreviewing(true);
        }
        setIsExporting(false);
        setRenderingItems([]);
      }
    };
    performCapture();
  }, [isExporting, renderingItems]);

  const handleExportLong = () => {
    setShowExportMenu(false);
    setIsExporting(true);
    setExportProgress(0);
    setExportSubMode('main');
    setRenderingItems(data.items);
  };

  const handleExportSelectedPreview = async () => {
    if (selectedItemIds.length === 0) return;
    setShowExportMenu(false);
    setIsExporting(true);
    const itemsToExport = data.items.filter(i => selectedItemIds.includes(i.id));
    const urls: string[] = [];
    for (let i = 0; i < itemsToExport.length; i++) {
      setExportProgress(Math.round((i / itemsToExport.length) * 100));
      setRenderingItems([itemsToExport[i]]);
      await new Promise(r => setTimeout(r, 1200));
      const node = exportContainerRef.current;
      if (node) {
        const url = await captureNode(node);
        if (url) urls.push(url);
      }
    }
    if (urls.length > 0) {
      setPreviewUrls(urls);
      setIsPreviewing(true);
    }
    setIsExporting(false);
    setRenderingItems([]);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGlobalClick = () => {
    setActivePicker(null); 
    setShowExportMenu(false); 
    setShowThemePicker(false);
    setShowConfig(false);
    setShowTagManager(false);
    setShowFontSizeSlider(false);
    setShowColorPicker(false);
  };

  const POPUP_WRAPPER_CLASS = "fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px)] left-4 right-4 bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.25)] border border-white/80 p-5 animate-in slide-in-from-bottom-4 fade-in duration-500 z-[300]";

  return (
    <div className="fixed inset-0 bg-[#E8E4DF] flex flex-col overflow-hidden" onClick={handleGlobalClick}>
      {isExporting && (
        <div className="absolute left-[-4000px] top-0 pointer-events-none" style={{ width: '1440px' }}>
          <SummaryCanvas 
            data={data} 
            currentTheme={currentTheme} 
            itemsToRender={renderingItems} 
            isExport={true} 
            exportContainerRef={exportContainerRef}
            updateDataField={updateDataField}
            updateItemField={updateItemField}
            removeItem={removeItem}
            activePicker={activePicker}
            setActivePicker={setActivePicker}
            handlePaste={handlePaste}
            setShowTagManager={setShowTagManager}
            addContentBlock={addContentBlock}
            removeContentBlock={removeContentBlock}
            updateContentBlock={updateContentBlock}
          />
        </div>
      )}

      <main ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth overflow-x-hidden">
        <div style={{ width: '100%', height: `${canvasRealHeight * scale}px`, position: 'relative' }}>
          <div style={{ width: '1440px', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
            <SummaryCanvas 
              data={data} 
              currentTheme={currentTheme} 
              itemsToRender={data.items} 
              canvasRef={canvasRef}
              updateDataField={updateDataField}
              updateItemField={updateItemField}
              removeItem={removeItem}
              activePicker={activePicker}
              setActivePicker={setActivePicker}
              handlePaste={handlePaste}
              setShowTagManager={setShowTagManager}
              addContentBlock={addContentBlock}
              removeContentBlock={removeContentBlock}
              updateContentBlock={updateContentBlock}
            />
          </div>
        </div>
        <div className="h-[30px] pointer-events-none" />
      </main>

      {showScrollTop && (
        <button onClick={(e) => { e.stopPropagation(); scrollToTop(); }} className="fixed bottom-32 right-6 w-14 h-14 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/5 z-[60] animate-in fade-in zoom-in duration-300 active:scale-90" style={{ color: currentTheme.accent }}>
          <ArrowUp size={28} />
        </button>
      )}

      <div className="relative z-[250] bg-white/80 backdrop-blur-xl border-t border-black/5 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2 flex flex-col gap-2 relative border-b border-black/5">
          {showFontSizeSlider && (
            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[24px] p-4 shadow-xl border border-white animate-in slide-in-from-bottom-2 duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 py-1">
                <span className="text-[12px] font-black text-black/60 min-w-[24px] text-center font-mono">{currentFontSize}</span>
                <div className="flex-1 relative pt-1">
                  <input type="range" min="12" max="80" step="1" value={currentFontSize} onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentFontSize(val);
                    applyStyle('fontSize', val.toString());
                  }} className="w-full h-1 bg-gray-200 rounded-full appearance-none accent-black cursor-pointer relative z-10" />
                </div>
              </div>
            </div>
          )}
          {showColorPicker && (
            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[24px] p-4 shadow-xl border border-white animate-in slide-in-from-bottom-2 duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5">
                {COLOR_PRESETS.map((color) => (
                  <button key={color} onClick={() => { applyStyle('foreColor', color); setShowColorPicker(false); }} className="w-9 h-9 rounded-full shrink-0 shadow-inner border border-black/5 flex items-center justify-center overflow-hidden" style={{ backgroundColor: color }}>
                    {color === '#FFFFFF' && <div className="w-1/2 h-[1px] bg-gray-100 rotate-45"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            {toolbarMode === 'normal' ? (
              <div className="flex items-center gap-1 w-full flex-nowrap overflow-x-auto no-scrollbar">
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyLeft'); }} className={`p-2.5 rounded-2xl transition-all shrink-0 ${currentAlignment === 'left' ? 'bg-black text-white' : 'hover:bg-black/5'}`}><AlignLeft size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyCenter'); }} className={`p-2.5 rounded-2xl transition-all shrink-0 ${currentAlignment === 'center' ? 'bg-black text-white' : 'hover:bg-black/5'}`}><AlignCenter size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyRight'); }} className={`p-2.5 rounded-2xl transition-all shrink-0 ${currentAlignment === 'right' ? 'bg-black text-white' : 'hover:bg-black/5'}`}><AlignRight size={20} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle('justifyFull'); }} className={`p-2.5 rounded-2xl transition-all shrink-0 ${currentAlignment === 'justify' ? 'bg-black text-white' : 'hover:bg-black/5'}`}><AlignJustify size={20} /></button>
                <div className="w-[1px] h-6 bg-black/5 mx-1 shrink-0"></div>
                <button onMouseDown={(e) => { e.preventDefault(); setShowFontSizeSlider(!showFontSizeSlider); setShowColorPicker(false); }} className={`p-2.5 rounded-2xl transition-colors flex items-center gap-1 shrink-0 ${showFontSizeSlider ? 'bg-black text-white' : 'hover:bg-black/5'}`}><Type size={20} /></button>
                <div className="w-[1px] h-6 bg-black/5 mx-1 shrink-0"></div>
                <button onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); setShowFontSizeSlider(false); }} className={`p-2.5 rounded-2xl transition-colors shrink-0 ${showColorPicker ? 'bg-black/10' : 'hover:bg-black/5'}`}><Palette size={20} style={{ color: currentTheme.accent }} /></button>
                <div className="flex-1"></div>
                <button onClick={(e) => { e.stopPropagation(); setToolbarMode('batch'); }} className="p-2.5 bg-black/5 rounded-2xl flex items-center gap-2 shrink-0"><Search size={18} /><span className="text-[10px] font-bold">批量</span></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full flex-nowrap animate-in fade-in duration-300">
                <div className="flex-1 relative min-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={batchSearchTerm} onChange={e => setBatchSearchTerm(e.target.value)} placeholder="搜索并批量对齐..." className="w-full bg-black/5 rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-bold outline-none focus:bg-white border border-transparent transition-all" />
                </div>
                <div className="flex items-center gap-0.5 shrink-0 bg-black/5 p-1 rounded-xl">
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('left'); }} className="p-2 hover:bg-black/10 rounded-lg"><AlignLeft size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('center'); }} className="p-2 hover:bg-black/10 rounded-lg"><AlignCenter size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); batchModifyAlignment('right'); }} className="p-2 hover:bg-black/10 rounded-lg"><AlignRight size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setToolbarMode('normal'); }} className="p-2 ml-1 bg-black text-white rounded-lg"><Check size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="h-14 flex items-center justify-around px-4 safe-area-bottom shrink-0">
          <div className="relative">
            {showConfig && (
              <div className={POPUP_WRAPPER_CLASS} onClick={e => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: currentTheme.accent }}></div><h3 className="text-[15px] font-serif font-black text-gray-800 tracking-tight">编辑概览</h3></div>
                    <button onClick={() => setShowConfig(false)} className="text-gray-300 hover:text-black"><X size={16}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 pl-1 uppercase">项目标题</label><input value={data.mainTitle} onChange={e => updateDataField('mainTitle', e.target.value)} className="w-full bg-black/[0.03] px-3 py-2.5 rounded-[16px] text-[11px] font-serif font-black outline-none transition-all" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 pl-1 uppercase">作者姓名</label><input value={data.author} onChange={e => updateDataField('author', e.target.value)} className="w-full bg-black/[0.03] px-3 py-2.5 rounded-[16px] text-[11px] font-black outline-none transition-all" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 pl-1 uppercase">总结类型</label><input value={data.summaryType} onChange={e => updateDataField('summaryType', e.target.value)} className="w-full bg-black/[0.03] px-3 py-2.5 rounded-[16px] text-[11px] font-bold outline-none transition-all" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 pl-1 uppercase">项目年份</label><input value={data.year} onChange={e => updateDataField('year', e.target.value)} className="w-full bg-black/[0.03] px-3 py-2.5 rounded-[16px] text-[11px] font-mono font-black outline-none transition-all" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 pl-1 uppercase">总结前言</label><textarea value={data.intro} onChange={e => updateDataField('intro', e.target.value)} className="w-full bg-black/[0.03] px-3 py-3 rounded-[16px] text-[11px] font-serif outline-none transition-all min-h-[100px] resize-none" placeholder="填写总结前言..." /></div>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowConfig(!showConfig); setShowTagManager(false); setShowThemePicker(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showConfig ? 'text-black' : 'text-black/40'}`}><Settings2 size={18} /><span className="text-[10px] font-bold">设定</span></button>
          </div>
          <div className="relative">
            {showTagManager && (
              <div className={POPUP_WRAPPER_CLASS} onClick={e => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-[15px] font-serif font-black text-gray-800">库管理</h3><button onClick={() => setShowTagManager(false)} className="text-gray-300 hover:text-black"><X size={16} /></button></div>
                  <div className="space-y-5 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                    <div className="space-y-2.5"><label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">分类存储</label><div className="flex flex-wrap gap-2">{data.savedCategories.map((cat, i) => (<div key={i} className="flex items-center gap-1.5 bg-black/[0.02] border border-black/5 px-3 py-1.5 rounded-full text-[11px] font-black">{cat}<button onClick={() => setData(prev => ({...prev, savedCategories: prev.savedCategories.filter(c => c !== cat)}))} className="text-gray-300 hover:text-red-500"><X size={12} /></button></div>)) }</div><div className="flex gap-2 pt-1"><input value={newCatInput} onChange={e => setNewCatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} placeholder="新分类" className="flex-1 bg-black/[0.03] rounded-[12px] px-3 py-2 text-[11px] font-bold outline-none" /><button onClick={addCategory} className="bg-black text-white w-9 h-9 flex items-center justify-center rounded-[12px]"><Plus size={16} /></button></div></div>
                    <div className="space-y-2.5"><label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">形式标签</label><div className="flex flex-wrap gap-2">{data.savedTypes.map((t, i) => (<div key={i} className="flex items-center gap-1.5 bg-black/[0.02] border border-black/5 px-3 py-1.5 rounded-full text-[11px] font-black italic">{t}<button onClick={() => setData(prev => ({...prev, savedTypes: prev.savedTypes.filter(st => t !== st)}))} className="text-gray-300 hover:text-red-500"><X size={12} /></button></div>))}</div><div className="flex gap-2 pt-1"><input value={newTypeInput} onChange={e => setNewTypeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addType()} placeholder="新形式" className="flex-1 bg-black/[0.03] rounded-[12px] px-3 py-2 text-[11px] font-bold outline-none" /><button onClick={addType} className="bg-black text-white w-9 h-9 flex items-center justify-center rounded-[12px]"><Plus size={16} /></button></div></div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowTagManager(!showTagManager); setShowConfig(false); setShowThemePicker(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showTagManager ? 'text-black' : 'text-black/40'}`}><Tags size={18} /><span className="text-[10px] font-bold">库</span></button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); addNewItem(); }} className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white shadow-xl transition-transform"><Plus size={20} strokeWidth={3} /></button>
          <div className="relative">
            {showThemePicker && (
              <div className={POPUP_WRAPPER_CLASS} onClick={e => e.stopPropagation()}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-[15px] font-serif font-black text-gray-800">切换主题</h3><button onClick={() => setShowThemePicker(false)} className="text-gray-300 hover:text-black"><X size={16} /></button></div>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map(t => (<button key={t.id} onClick={() => { setData({...data, themeId: t.id}); setShowThemePicker(false); }} className={`flex items-center gap-3 p-3 rounded-[18px] transition-all border ${data.themeId === t.id ? 'bg-black/[0.05] border-black/10' : 'bg-black/[0.01] border-transparent'}`}><div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.accent }}></div><span className={`text-[12px] font-black ${data.themeId === t.id ? 'text-black' : 'text-gray-400'}`}>{t.name}</span>{data.themeId === t.id && <Check size={14} className="ml-auto opacity-50" />}</button>))}
                  </div>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowThemePicker(!showThemePicker); setShowConfig(false); setShowTagManager(false); setShowExportMenu(false); }} className={`flex flex-col items-center gap-0.5 transition-colors ${showThemePicker ? 'text-black' : 'text-black/40'}`}><Palette size={18} /><span className="text-[10px] font-bold">主题</span></button>
          </div>
          <div className="relative">
            {showExportMenu && (
              <div className={POPUP_WRAPPER_CLASS} onClick={e => e.stopPropagation()}>
                {exportSubMode === 'main' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><h3 className="text-[15px] font-serif font-black text-gray-800">导出发布</h3><button onClick={() => setShowExportMenu(false)} className="text-gray-300 hover:text-black"><X size={16} /></button></div>
                    <div className="flex flex-col gap-2">
                      <button onClick={handleExportLong} className="flex items-center gap-3 p-4 bg-black/[0.02] hover:bg-black/[0.05] rounded-[18px] transition-all"><Layers size={20} className="opacity-40" /><span className="font-black text-[13px] text-gray-800">生成 1440px 完整长图</span></button>
                      <button onClick={() => setExportSubMode('select')} className="flex items-center gap-3 p-4 bg-black/[0.02] hover:bg-black/[0.05] rounded-[18px] transition-all"><CheckSquare size={20} className="opacity-40" /><span className="font-black text-[13px] text-gray-800">选择特定模块生成预览图</span></button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 min-h-[220px] flex flex-col">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><button onClick={() => setExportSubMode('main')} className="text-gray-400"><ChevronLeft size={20} /></button><h3 className="text-[15px] font-serif font-black text-gray-800">勾选模块 ({selectedItemIds.length})</h3></div><button onClick={() => setShowExportMenu(false)} className="text-gray-300 hover:text-black"><X size={16} /></button></div>
                    <div className="grid grid-cols-5 gap-2 overflow-y-auto no-scrollbar max-h-40 p-1">
                      {data.items.map((item, i) => (<button key={item.id} onClick={() => toggleItemSelection(item.id)} className={`h-10 rounded-[12px] font-mono font-black text-[12px] transition-all border ${selectedItemIds.includes(item.id) ? 'bg-black border-black text-white' : 'bg-black/[0.02] border-black/5 text-gray-300'}`}>{String(data.items.findIndex(it => it.id === item.id) + 1).padStart(2, '0')}</button>))}
                    </div>
                    <button onClick={handleExportSelectedPreview} className="w-full bg-black text-white py-4 rounded-[18px] font-black text-[14px] flex items-center justify-center gap-2 mt-auto shadow-xl">生成发布 <ArrowRight size={16} /></button>
                  </div>
                )}
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); if(!showExportMenu) { setExportSubMode('main'); setSelectedItemIds([]); } setShowThemePicker(false); setShowConfig(false); setShowTagManager(false); }} disabled={isExporting} className={`flex flex-col items-center gap-0.5 transition-colors ${showExportMenu ? 'text-black' : 'text-black/40'}`}>{isExporting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}<span className="text-[10px] font-bold">发布</span></button>
          </div>
        </footer>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
           <div className="bg-white p-6 rounded-[24px] flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in duration-300">
             <Loader2 size={32} className="animate-spin text-black" />
             <div className="text-center">
               <p className="text-[14px] font-black mb-1">正在渲染...</p>
               <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-black transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
               </div>
             </div>
           </div>
        </div>
      )}

      {isPreviewing && previewUrls.length > 0 && (
        <div className="fixed inset-0 z-[600] flex flex-col" style={{ backgroundColor: currentTheme.bg }}>
          <div className="h-14 flex items-center justify-between px-6 bg-white/40 backdrop-blur-2xl shrink-0 border-b border-black/5">
            <button onClick={() => { previewUrls.forEach(URL.revokeObjectURL); setIsPreviewing(false); }} className="font-bold flex items-center gap-2 text-[14px]" style={{ color: currentTheme.text }}><ChevronLeft size={18} /> 返回</button>
            <button onClick={() => { previewUrls.forEach((url, i) => { const link = document.createElement('a'); link.download = `年度总结_${data.year}_${i+1}.png`; link.href = url; link.click(); }); }} className="text-white px-4 py-1.5 rounded-full font-black text-[11px] shadow-lg" style={{ backgroundColor: currentTheme.accent }}>保存图片</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
            {previewUrls.map((url, i) => (<div key={i} className="w-full max-w-[1440px] mx-auto shadow-2xl rounded-[24px] overflow-hidden bg-white/20 border border-white/20"><img src={url} alt={`PREVIEW ${i}`} className="w-full h-auto block" style={{ objectFit: 'contain' }} /></div>))}
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
