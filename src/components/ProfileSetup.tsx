import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button, Input, Label, Card } from './ui/common';
import { motion } from 'motion/react';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    birthYear: '',
    status: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.birthYear && profile.status) {
      onComplete(profile);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 border-t-4 border-t-indigo-600 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">자아발견 연구소에 오신 것을 환영합니다</h1>
            <p className="text-gray-600">나를 알아가는 여정을 시작하기 위해<br/>기본 정보를 입력해주세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">이름 (또는 닉네임)</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="홍길동"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthYear">출생년도</Label>
              <select
                id="birthYear"
                value={profile.birthYear}
                onChange={(e) => setProfile({ ...profile, birthYear: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">선택해주세요</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">현재 상태</Label>
              <select
                id="status"
                value={profile.status}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">선택해주세요</option>
                <option value="대학생">대학생</option>
                <option value="취업준비생">취업준비생</option>
                <option value="직장인">직장인</option>
                <option value="프리랜서">프리랜서</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <Button type="submit" className="w-full py-6 text-lg" size="lg">
              시작하기
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
