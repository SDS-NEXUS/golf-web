<template>
  <h2 class="h6 mb-2"><i class="fa-solid fa-book me-1 text-success"></i>골때리는골프 포인트 규정</h2>

  <div class="rule-block">
    <div class="rule-block-h">1. 라운드 포인트 배점</div>
    <div class="rule-block-b p-0">
      <table class="table table-sm mb-0">
        <tbody>
          <tr><td>1위</td><td class="text-end fw-bold text-warning">100</td></tr>
          <tr><td>2위</td><td class="text-end">85</td></tr>
          <tr><td>3위</td><td class="text-end">75</td></tr>
          <tr><td>4위</td><td class="text-end">68</td></tr>
          <tr><td>5위</td><td class="text-end">62</td></tr>
          <tr><td>6위 이후</td><td class="text-end text-muted">−2 / 최소 30</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">2. 보너스 점수</div>
    <div class="rule-block-b p-0">
      <table class="table table-sm mb-0">
        <tbody>
          <tr><td>홀인원</td><td class="text-end fw-bold text-danger">+30</td></tr>
          <tr><td>알바트로스 (−3)</td><td class="text-end fw-bold">+20</td></tr>
          <tr><td>이글 (−2)</td><td class="text-end fw-bold">+10</td></tr>
          <tr><td>버디 (−1)</td><td class="text-end">+3</td></tr>
          <tr><td>최저 그로스</td><td class="text-end">+5</td></tr>
          <tr><td>백나인 베스트</td><td class="text-end">+3</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">3. 라운드 가중치 (순번 × 구장 난이도)</div>
    <div class="rule-block-b p-0">
      <table class="table table-sm mb-0">
        <tbody>
          <tr><td>1~6라운드 (순번)</td><td class="text-end">1.0×</td></tr>
          <tr><td>7라운드</td><td class="text-end text-warning fw-bold">1.2×</td></tr>
          <tr><td>8라운드 (최종)</td><td class="text-end text-danger fw-bold">1.5×</td></tr>
        </tbody>
      </table>
      <div class="px-3 py-2" style="font-size:11px;">
        <strong>구장 난이도:</strong> 코스 길이 기준 ×0.90~1.15 (기준 ×1.00 = 고령 오펠GC 5,481m, 길수록 ↑)
        <div class="text-muted mt-1">최종 = 순번 × 구장 난이도 (상한 1.60) · 랭킹·보너스 모두 적용</div>
      </div>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">4. 핸디캡 (Net = Gross − H)</div>
    <div class="rule-block-b small">
      <div class="mb-1"><strong>베이스:</strong> 매 라운드 신페리오</div>
      <div class="mb-2 small">H<sub>peoria</sub> = (히든12합 × 1.2) − 72</div>
      <div class="mb-1"><strong>리그 상대 보정 (2라운드부터):</strong></div>
      <div class="mb-1 small">(본인 평균 − 리그 평균) × 0.15</div>
      <ul class="small mb-2 ps-3">
        <li>잘 친 사람 H 차감, 못 친 사람 H 가산</li>
        <li>시즌 내 최근 5라운드 데이터 사용</li>
        <li>게스트 데이터는 제외</li>
      </ul>
      <div class="mb-1"><strong>최종 H:</strong> 신페리오 + 보정 + 직전/출결 가감</div>
      <div class="text-muted small">범위 [0, 24] · 한 홀 max par+3</div>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">5. 직전 라운드 결과 가감</div>
    <div class="rule-block-b p-0">
      <table class="table table-sm mb-0">
        <tbody>
          <tr><td>1위</td><td class="text-end text-danger fw-bold">−1</td></tr>
          <tr><td>2위</td><td class="text-end">−0.5</td></tr>
          <tr><td>꼴찌</td><td class="text-end text-success fw-bold">+1</td></tr>
          <tr><td>차꼴찌 (≥4명)</td><td class="text-end">+0.5</td></tr>
        </tbody>
      </table>
      <div class="px-3 py-2 text-muted" style="font-size:11px;">결석 시에도 본인 마지막 참가 결과 가감 적용 (어드밴티지 방지)</div>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">6. 출결 H 조정</div>
    <div class="rule-block-b p-0">
      <table class="table table-sm mb-0">
        <tbody>
          <tr><td>풀 출석 (0결석)</td><td class="text-end text-success fw-bold">+1</td></tr>
          <tr><td>1결석</td><td class="text-end text-muted">0</td></tr>
          <tr><td>2결석</td><td class="text-end">−1</td></tr>
          <tr><td>3결석 이상</td><td class="text-end text-danger fw-bold">−2</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">7. 여성 성별 보정 (조정 Net = Net − 보정)</div>
    <div class="rule-block-b small">
      <ol class="ps-3 mb-0">
        <li>홀별 남여 평균 스코어 차이 합 (실측)</li>
        <li>구장 White CR − Ladies CR</li>
        <li>White − Ladies 거리(m) ÷ 200</li>
        <li>데이터 부족 시 보정 없음</li>
      </ol>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">8. 시즌 종합 순위</div>
    <div class="rule-block-b small">
      <ul class="ps-3 mb-0">
        <li>매 라운드 (랭킹 + 보너스) 합산</li>
        <li>드롭 안전장치: max(참여−드롭, ceil(참여/2))</li>
        <li>자격 최소(기본 4R) 미달 시 시상 제외 ("참고")</li>
      </ul>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">9. 히든홀 선정</div>
    <div class="rule-block-b small">
      <div>전·후반 각 6홀 / Par3:2 Par4:8 Par5:2 / 핸디캡 양극단 회피</div>
      <div class="text-muted">라운드 정보 + 확정 시각 시드 무작위 · 사전 계산 불가 · 확정 후 공개</div>
    </div>
  </div>

  <div class="rule-block">
    <div class="rule-block-h">10. 동타 처리</div>
    <div class="rule-block-b small text-muted">
      마지막 9홀 → 6홀 → 3홀 → 1홀 합계 카운트백 후 동순위 처리.
    </div>
  </div>
</template>

<style scoped>
.rule-block { background: #fff; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.rule-block-h { background: #f0fdf4; padding: 10px 12px; font-weight: 700; font-size: 13px; color: #0f5132; border-left: 4px solid #198754; }
.rule-block-b { padding: 10px 12px; }
.rule-block table { font-size: 12px; margin: 0; }
.rule-block table td, .rule-block table th { padding: 5px 8px; }
</style>
