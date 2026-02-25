import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button, Input } from './ui/common';
import { Experience } from '../types';
import { parseExperiencesFromUrl } from '../services/parser';

interface UrlImportModalProps {
  onComplete: (experiences: Experience[]) => void;
  onClose: () => void;
}

export function UrlImportModal({ onComplete, onClose }: UrlImportModalProps) {
  const [url, setUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      setError('올바른 URL 형식이 아닙니다. (http:// 또는 https:// 포함)');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const experiences = await parseExperiencesFromUrl(url);
      if (experiences.length === 0) {
        setError('해당 링크에서 유의미한 경험을 찾지 못했습니다. 다른 링크를 시도해보세요.');
      } else {
        onComplete(experiences);
      }
    } catch (err) {
      console.error(err);
      setError('링크를 분석하는 중 오류가 발생했습니다. 접근 권한이 없거나 지원하지 않는 형식일 수 있습니다.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <LinkIcon size={20} />
            링크로 경험 가져오기
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600 text-sm leading-relaxed">
              링크드인 프로필, 노션 포트폴리오, 개인 블로그 등 나의 경험이 정리된 웹페이지 주소를 입력하세요. AI가 내용을 분석하여 인생지도로 변환합니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">웹페이지 URL</label>
            <Input 
              placeholder="https://www.linkedin.com/in/..." 
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className="bg-gray-50 border-gray-200 focus:bg-white"
              disabled={isParsing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleImport();
              }}
            />
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs font-medium mt-1"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-1">
              <CheckCircle2 size={16} /> 지원하는 링크
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>공개된 노션(Notion) 페이지</li>
              <li>개인 블로그 (Velog, Tistory 등)</li>
              <li>깃허브(GitHub) 프로필</li>
              <li>기타 텍스트로 읽을 수 있는 공개 웹페이지</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2 opacity-80">
              * 로그인이 필요한 비공개 페이지나 링크드인(보안 정책)의 경우 분석이 제한될 수 있습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isParsing}
            className="text-gray-500 hover:text-gray-700"
          >
            취소
          </Button>
          <Button 
            onClick={handleImport}
            disabled={isParsing || !url.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md min-w-[120px]"
          >
            {isParsing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 분석 중...</>
            ) : (
              '가져오기'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
