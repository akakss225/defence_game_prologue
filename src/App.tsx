import { useEffect, useRef, useState } from 'react'
import { GameEngine } from './game/GameEngine'
import './App.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [isGameStarted, setIsGameStarted] = useState(false)

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current)
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop()
      }
    }
  }, [])

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start()
      setIsGameStarted(true)
    }
  }

  const stopGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop()
      setIsGameStarted(false)
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>타워 디펜스 게임</h1>
        <div className="game-controls">
          {!isGameStarted ? (
            <button onClick={startGame} className="start-button">
              게임 시작
            </button>
          ) : (
            <button onClick={stopGame} className="stop-button">
              게임 중지
            </button>
          )}
        </div>
      </div>
      
      <div className="game-instructions">
        <h3>게임 조작법</h3>
        <ul>
          <li>마우스 클릭: 타워 배치 및 선택</li>
          <li>U키: 선택된 타워 업그레이드</li>
          <li>스페이스바: 일시정지</li>
          <li>1키: 폭탄 사용</li>
          <li>2키: 시간정지 사용</li>
          <li>3키: 체력회복 사용</li>
          <li>4키: 방어막 사용</li>
          <li>ESC: 선택 해제</li>
        </ul>
      </div>

      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="game-canvas"
        />
      </div>

      <div className="game-info">
        <h3>게임 정보</h3>
        <p>• 5가지 속성의 타워: 화염, 빙결, 독, 전기, 물리</p>
        <p>• 10가지 적 유닛과 보스 몬스터</p>
        <p>• 50라운드의 점진적 난이도 증가</p>
        <p>• 특수 능력과 업그레이드 시스템</p>
        <p>• 각 라운드는 60초 제한, 유닛 40마리 시 게임오버</p>
        <p>• 모든 적을 잡으면 자동으로 다음 라운드 진행</p>
        <p>• 몬스터는 계속 맵을 순환하며, 타워에 의해 죽기 전까지 계속 돌아다닙니다</p>
      </div>
    </div>
  )
}

export default App
