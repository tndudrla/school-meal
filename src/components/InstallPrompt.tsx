'use client';

import { useEffect, useState } from 'react';

/**
 * 홈 화면 추가 유도 배너 (Stage 11).
 *
 * - 안드로이드 Chrome: `beforeinstallprompt` 이벤트 가로채 우리 버튼이
 *   직접 OS 설치 다이얼로그 띄움
 * - iOS Safari: BIP 표준 미지원 → 단계 안내 모달
 * - 카톡 인앱 브라우저: 설치 자체 불가 → 안 띄움
 * - 이미 standalone(홈 화면에서 켰을 때) → 안 띄움
 * - 사용자가 X 닫음 → localStorage 기록, 다음 방문에도 안 띄움
 */

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dismissedInstallBanner';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);
  const [bipEvent, setBipEvent] = useState<BIPEvent | null>(null);
  const [iosModal, setIosModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 이미 standalone (홈 화면에서 켰을 때) — 안 띄움
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // 사용자가 X 로 닫음
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return;

    const ua = window.navigator.userAgent;

    // 카톡 인앱: 설치 자체 불가
    if (/KAKAOTALK/i.test(ua)) return;

    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    if (!isAndroid && !isIOS) return; // 데스크톱은 안 띄움

    setPlatform(isAndroid ? 'android' : 'ios');

    if (isAndroid) {
      // BIP 이벤트는 진입 직후가 아니라 Chrome 의 휴리스틱(스크롤·시간 등)
      // 통과 후 발사. 그 전엔 배너만 미리 그려놓을 수도 있으나, 버튼 누른
      // 시점에 evt 가 없으면 동작 못 함. 그래서 BIP 받기 전엔 배너 숨김.
      const handler = (evt: Event) => {
        evt.preventDefault();
        setBipEvent(evt as BIPEvent);
        setShow(true);
      };
      const installed = () => setShow(false);
      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', installed);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', installed);
      };
    }

    // iOS: BIP 없으니 즉시 표시
    setShow(true);
  }, []);

  function dismiss() {
    setShow(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1');
    }
  }

  async function handleInstall() {
    if (platform === 'android' && bipEvent) {
      await bipEvent.prompt();
      const { outcome } = await bipEvent.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      // 'dismissed' 라도 영구 닫기는 안 함 — 다음 진입에 다시 시도 가능
    } else if (platform === 'ios') {
      setIosModal(true);
    }
  }

  if (!show) return null;

  return (
    <>
      <div className="mx-5 mt-3 p-3 bg-amber-100 rounded-2xl border border-dashed border-amber-200 flex items-center justify-between gap-2">
        <div className="text-xs text-stone-600 leading-relaxed flex-1">
          <span className="text-base">📱</span>{' '}
          <strong className="text-orange-500 font-['Gaegu']">홈 화면에 추가</strong>
          {' '}하면 앱처럼 쓸 수 있어요
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleInstall}
            className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            추가하기
          </button>
          <button
            onClick={dismiss}
            aria-label="안내 닫기"
            className="text-stone-400 hover:text-stone-600 px-2 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {iosModal && (
        <IosInstallModal
          onClose={() => setIosModal(false)}
          onDismiss={() => {
            setIosModal(false);
            dismiss();
          }}
        />
      )}
    </>
  );
}

function IosInstallModal({
  onClose,
  onDismiss,
}: {
  onClose: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center mb-5">
          <div className="text-5xl mb-2">📱</div>
          <h2 className="font-['Gaegu'] text-xl font-bold text-stone-800">
            iPhone 에서 앱처럼 사용하기
          </h2>
        </div>

        <ol className="flex flex-col gap-3 text-sm text-stone-700 mb-6">
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <span className="leading-relaxed">
              화면 하단 <strong>공유 버튼</strong>{' '}
              <svg
                className="inline-block w-4 h-4 align-text-bottom"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {' '}을 누르세요
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <span className="leading-relaxed">
              메뉴를 내려서 <strong>"홈 화면에 추가"</strong> 를 선택하세요
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <span className="leading-relaxed">
              우측 상단 <strong>"추가"</strong> 를 누르면 끝!
            </span>
          </li>
        </ol>

        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            확인
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2 text-xs text-stone-500 hover:text-stone-700 transition-colors"
          >
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
