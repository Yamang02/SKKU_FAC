# 3000번 포트를 사용하는 프로세스 찾기
$processId = (netstat -ano | findstr :3000 | findstr LISTENING) -split ' +' | Select-Object -Last 1

# 프로세스가 존재하면 종료
if ($processId) {
    Write-Host "Stopping process with PID: $processId"
    taskkill /PID $processId /F
}

# 잠시 대기
Start-Sleep -Seconds 1

# 서버 재시작
Write-Host "Starting server..."
npm run dev
