import { useCallback, useEffect, useRef } from 'react';
import {
  CAMERA_ANIMATION_DURATION,
  clampValue,
  getSplinePose,
  mapSplinePoseToStage,
  storyChapters,
  initialStageCamera,
} from './data';

const useTourCamera = ({
  phase,
  currentChapter,
  isDragging,
  setIsDragging,
  setHasInteracted,
  setShowOrbitHint,
  syncActiveSectionFromProgress,
}) => {
  const dragStartRef = useRef({ x: 0, y: 0 });
  const tiltStartRef = useRef({ x: 0, y: 0 });
  const tiltTargetRef = useRef({ x: 0, y: 0 });
  const tiltCurrentRef = useRef({ x: 0, y: 0 });
  const nudgeRef = useRef({ x: 0, y: 0 });
  const lookAtOffsetRef = useRef(initialStageCamera.lookAtOffset);
  const cameraDollyRef = useRef(initialStageCamera.cameraDolly);
  const roomShellRef = useRef(null);
  const roomAtmoRef = useRef(null);
  const cameraAnimationFrameRef = useRef(null);
  const cameraPositionRef = useRef(initialStageCamera.position);
  const hasMountedCameraRef = useRef(false);

  const stopCameraAnimation = useCallback(() => {
    if (cameraAnimationFrameRef.current) {
      cancelAnimationFrame(cameraAnimationFrameRef.current);
      cameraAnimationFrameRef.current = null;
    }
  }, []);

  const applySplinePoseToStage = useCallback((pose) => {
    const stagePose = mapSplinePoseToStage(pose);
    cameraPositionRef.current = stagePose.position;
    cameraDollyRef.current = stagePose.cameraDolly;
    lookAtOffsetRef.current = stagePose.lookAtOffset;
    nudgeRef.current = stagePose.nudge;
  }, []);

  const onPointerDown = useCallback((event) => {
    if (phase !== 'room') return;
    stopCameraAnimation();
    setHasInteracted(true);
    setIsDragging(true);
    setShowOrbitHint(false);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    tiltStartRef.current = { ...tiltTargetRef.current };
  }, [phase, setHasInteracted, setIsDragging, setShowOrbitHint, stopCameraAnimation]);

  const onPointerMove = useCallback((event) => {
    if (phase !== 'room') return;
    if (!isDragging) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      tiltTargetRef.current = { x, y };
      return;
    }
    const deltaX = (event.clientX - dragStartRef.current.x) / 180;
    const deltaY = (event.clientY - dragStartRef.current.y) / 180;
    tiltTargetRef.current = {
      x: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.x + deltaX)),
      y: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.y + deltaY)),
    };
  }, [phase, isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    if (phase === 'room') return;
    tiltTargetRef.current = { x: 0, y: 0 };
    tiltCurrentRef.current = { x: 0, y: 0 };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'room') return undefined;
    let frameId;
    const tick = () => {
      const target = tiltTargetRef.current;
      const current = tiltCurrentRef.current;
      const nextX = current.x + (target.x - current.x) * 0.18;
      const nextY = current.y + (target.y - current.y) * 0.18;
      tiltCurrentRef.current = { x: nextX, y: nextY };

      const nudge = nudgeRef.current;
      const lookAt = lookAtOffsetRef.current;
      const cameraDolly = cameraDollyRef.current;
      const rotateX = -6 + nextY * 8 + nudge.y + lookAt.y;
      const rotateY = 14 + nextX * 14 + nudge.x + lookAt.x;
      const dolly = cameraDolly + Math.abs(nextX) * 5 + Math.abs(nextY) * 4;
      const perspectiveScale = 1 + (50 - cameraDolly) / 500;

      if (roomShellRef.current) {
        roomShellRef.current.style.transform = `translateZ(${dolly.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${perspectiveScale})`;
      }
      if (roomAtmoRef.current) {
        roomAtmoRef.current.style.setProperty('--atmo-x', `${(nextX * 14).toFixed(2)}px`);
        roomAtmoRef.current.style.setProperty('--atmo-y', `${(nextY * 10).toFixed(2)}px`);
      }

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [phase]);

  useEffect(() => {
    const chapter = storyChapters[currentChapter];
    if (!chapter?.cameraPath?.length) return undefined;

    stopCameraAnimation();
    const path = [cameraPositionRef.current, ...chapter.cameraPath];

    if (!hasMountedCameraRef.current) {
      applySplinePoseToStage(getSplinePose(path, 0));
      hasMountedCameraRef.current = true;
      return undefined;
    }

    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (now) => {
      const linearProgress = clampValue((now - startTime) / CAMERA_ANIMATION_DURATION, 0, 1);
      const easedProgress = easeInOutCubic(linearProgress);
      applySplinePoseToStage(getSplinePose(path, easedProgress));
      syncActiveSectionFromProgress(easedProgress);

      if (linearProgress < 1) {
        cameraAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        cameraAnimationFrameRef.current = null;
      }
    };

    cameraAnimationFrameRef.current = requestAnimationFrame(animate);
    return () => stopCameraAnimation();
  }, [currentChapter, applySplinePoseToStage, stopCameraAnimation, syncActiveSectionFromProgress]);

  return {
    nudgeRef,
    lookAtOffsetRef,
    cameraDollyRef,
    roomShellRef,
    roomAtmoRef,
    stopCameraAnimation,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};

export default useTourCamera;
