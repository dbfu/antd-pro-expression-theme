import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';


const expressionMap: any = {
  "neutral": '正常',
  "happy": '开心',
  "sad": '悲伤',
  "surprised": '惊讶',
}

const Hidden = true;

function getExpressionResult(expression: any) {
  if (!expression) return;
  const keys = [
    'neutral',
    'happy',
    'sad',
    'angry',
    'fearful',
    'disgusted',
    'surprised',
  ];

  const curExpression = keys.reduce((prev: string, cur: string) => {
    if (!prev) {
      return cur;
    } else {
      return expression[cur] > expression[prev] ? cur : prev;
    }
  }, '');
  return curExpression;
}

export function Expression({
  onExpressionChange,
}: any) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const [expression, setExpression] = useState<string | undefined>('');

  useEffect(() => {
    if (onExpressionChange) {
      onExpressionChange(expression);
    }
  }, [expression]);

  async function run() {
    await faceapi.nets.tinyFaceDetector.load('/widgets/');

    await faceapi.loadSsdMobilenetv1Model('/widgets/');
    await faceapi.loadFaceLandmarkModel('/widgets/');
    await faceapi.loadFaceExpressionModel('/widgets/');

    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }

  useEffect(() => {
    run();
  }, []);

  async function onPlay(): Promise<any> {

    const videoEl = videoRef.current;

    if (!videoEl) return;

    if (videoEl.paused || videoEl.ended) return setTimeout(() => onPlay());

    const result = await faceapi
      .detectSingleFace(videoEl)
      .withFaceExpressions();

    setExpression(getExpressionResult(result?.expressions))

    setTimeout(() => onPlay());
  }

  return (
    <div style={{ opacity: Hidden ? 0 : 1  }} >
      <video
        style={{
          background: '#fff',
          width: 640,
          height: 480,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: Hidden ? 0 : 10001
        }}
        onLoadedMetadata={() => { onPlay() }}
        id="inputVideo"
        autoPlay
        muted
        playsInline
        ref={videoRef}
      />
      <div
        style={{
          opacity: 1,
          width: 640,
          height: 480,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: Hidden ? 0 : 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        {expressionMap?.[expression || 'neutral']}
      </div>
    </div>
  )
}