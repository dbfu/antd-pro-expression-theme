import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { DeleteOutlined } from '@ant-design/icons'


const expressionMap: any = {
  "neutral": '正常',
  "happy": '开心',
  "sad": '悲伤',
  "surprised": '惊讶',
}


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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (onExpressionChange) {
      onExpressionChange(expression);
    }
  }, [expression]);

  async function run() {
    await faceapi.nets.tinyFaceDetector.load('/antd-pro-expression-theme/widgets/');

    await faceapi.loadSsdMobilenetv1Model('/antd-pro-expression-theme/widgets/');
    await faceapi.loadFaceLandmarkModel('/antd-pro-expression-theme/widgets/');
    await faceapi.loadFaceExpressionModel('/antd-pro-expression-theme/widgets/');

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
    <div style={{ opacity: hidden ? 0 : 1 }} >
      <div style={{
        opacity: 1,
        width: 640,
        height: 480,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: hidden ? 0 : 10003,
        color: 'red',
      }}>
        <div
          style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
          onClick={() => { setHidden(true) }}
        >
          <DeleteOutlined />
        </div>
      </div>
      <video
        style={{
          background: '#fff',
          width: 640,
          height: 480,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: hidden ? 0 : 10001
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
          zIndex: hidden ? 0 : 10001,
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