const SAVE_KEY = 'campus-heart-web-mvp-save';
const END_DAY = 7;

const initialState = () => ({
  day: 1,
  knowledge: 0,
  fitness: 0,
  charm: 0,
  stress: 0,
  affection: 0,
  flags: {
    helpedHer: false,
    sharedDream: false,
    wonTalentShow: false,
  },
  ending: null,
  story: '새 학기가 시작됐다. 에셋은 적고 인생은 빡세지만, 일단 일주일 동안은 해볼 만하다.',
  pendingEvent: null,
});

let state = initialState();

const statusEl = document.getElementById('status');
const storyEl = document.getElementById('story');
const actionsEl = document.getElementById('actions');
const choicesEl = document.getElementById('choices');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const resetBtn = document.getElementById('resetBtn');

const actions = [
  {
    id: 'study',
    label: '공부하기',
    apply() {
      state.knowledge += 2;
      state.stress += 1;
      if (state.knowledge >= 4) state.charm += 1;
      advanceDay('도서관에서 시간을 태웠다. 머리는 차오르고 어깨는 굳는다.');
    },
  },
  {
    id: 'workout',
    label: '운동하기',
    apply() {
      state.fitness += 2;
      state.stress = Math.max(0, state.stress - 1);
      if (state.fitness >= 4) state.charm += 1;
      advanceDay('운동장을 돌고 나니 몸이 깨어난다. 보기보다 사람 꼴이 난다.');
    },
  },
  {
    id: 'talk',
    label: '그녀와 대화',
    apply() {
      state.affection += 1;
      state.charm += 1;
      state.stress += 1;
      advanceDay('사소한 잡담이었지만, 그녀는 네 말을 꽤 기억하는 눈치다.');
    },
  },
  {
    id: 'rest',
    label: '쉬기',
    apply() {
      state.stress = Math.max(0, state.stress - 2);
      advanceDay('오늘은 숨을 골랐다. 세상이 잠깐 덜 음험해 보인다.');
    },
  },
];

function render() {
  renderStatus();
  storyEl.textContent = state.story;
  renderActions();
  renderChoices();
}

function renderStatus() {
  const items = [
    ['Day', `${Math.min(state.day, END_DAY)} / ${END_DAY}`],
    ['지식', state.knowledge],
    ['체력', state.fitness],
    ['매력', state.charm],
    ['스트레스', state.stress],
    ['호감도', state.affection],
  ];

  statusEl.innerHTML = items
    .map(([label, value]) => `
      <div class="stat-card">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
      </div>
    `)
    .join('');
}

function renderActions() {
  actionsEl.innerHTML = '';

  for (const action of actions) {
    const button = document.createElement('button');
    button.textContent = action.label;
    button.disabled = Boolean(state.pendingEvent) || Boolean(state.ending);
    button.addEventListener('click', action.apply);
    actionsEl.appendChild(button);
  }
}

function renderChoices() {
  choicesEl.innerHTML = '';

  if (!state.pendingEvent) return;

  const title = document.createElement('h3');
  title.textContent = state.pendingEvent.title;
  choicesEl.appendChild(title);

  state.pendingEvent.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.textContent = choice.label;
    button.addEventListener('click', () => {
      choice.resolve();
      state.pendingEvent = null;
      render();
    });
    choicesEl.appendChild(button);
  });
}

function advanceDay(message) {
  state.day += 1;
  state.story = message;

  if (checkEnding()) {
    render();
    return;
  }

  triggerEventIfNeeded();
  render();
}

function triggerEventIfNeeded() {
  if (state.day === 3 && !state.flags.helpedHer) {
    state.pendingEvent = {
      title: '복도 이벤트',
      choices: [
        {
          label: '서류를 주워 도와준다',
          resolve() {
            state.flags.helpedHer = true;
            state.affection += 2;
            state.charm += 1;
            state.story = '서류를 정리해주자 그녀가 잠깐 웃었다. 은근히 크게 먹혔다.';
          },
        },
        {
          label: '모른 척 지나간다',
          resolve() {
            state.flags.helpedHer = true;
            state.affection = Math.max(0, state.affection - 1);
            state.story = '그냥 지나쳤다. 편하긴 한데, 약간 좀 그렇다.';
          },
        },
      ],
    };
    state.story += '\n\n복도에서 그녀가 서류를 떨어뜨렸다.';
    return;
  }

  if (state.day === 5 && state.affection >= 2 && !state.flags.sharedDream) {
    state.pendingEvent = {
      title: '벤치 이벤트',
      choices: [
        {
          label: '진짜 꿈을 말한다',
          resolve() {
            state.flags.sharedDream = true;
            state.affection += 2;
            state.knowledge += 1;
            state.story = '너는 진심으로 말했고, 그녀도 장난 없이 네 말을 들었다.';
          },
        },
        {
          label: '적당히 얼버무린다',
          resolve() {
            state.flags.sharedDream = true;
            state.charm += 1;
            state.story = '분위기는 무난했지만, 깊게 닿진 않았다.';
          },
        },
      ],
    };
    state.story += '\n\n벤치에 앉은 그녀가 네 꿈이 뭐냐고 묻는다.';
    return;
  }

  if (state.day === 6 && state.knowledge >= 4 && state.charm >= 3 && !state.flags.wonTalentShow) {
    state.pendingEvent = {
      title: '축제 발표 이벤트',
      choices: [
        {
          label: '발표를 맡는다',
          resolve() {
            state.flags.wonTalentShow = true;
            state.affection += 1;
            state.charm += 2;
            state.story = '긴장했지만 잘 해냈다. 그녀도 꽤 인상 깊어했다.';
          },
        },
        {
          label: '뒤에서 지원만 한다',
          resolve() {
            state.knowledge += 1;
            state.story = '안전하게 뒤를 받쳤다. 큰 임팩트는 없지만 사고도 없다.';
          },
        },
      ],
    };
    state.story += '\n\n축제 발표 담당을 정해야 하는데, 다들 슬쩍 널 본다.';
  }
}

function checkEnding() {
  if (state.day <= END_DAY) return false;

  if (
    state.affection >= 5 &&
    state.flags.helpedHer &&
    state.flags.sharedDream &&
    state.knowledge + state.fitness >= 8
  ) {
    state.ending = '진엔딩 - 같은 방향';
    state.story = '서로를 잠깐 좋아한 정도가 아니다. 너는 네 삶도 붙들었고, 그녀와의 거리도 줄였다.';
  } else if (state.affection >= 4) {
    state.ending = '호감 엔딩 - 다음 약속';
    state.story = '확실한 관계까진 아니어도, 다음을 기대할 정도는 됐다. 이 정도면 꽤 선방이다.';
  } else if (state.knowledge >= 6 || state.fitness >= 6) {
    state.ending = '성장 엔딩 - 일단 너부터';
    state.story = '연애는 애매했지만 너 자신은 꽤 좋아졌다. 솔직히 이것도 큰 수확이다.';
  } else {
    state.ending = '평범 엔딩 - 무난한 일주일';
    state.story = '크게 얻은 것도 잃은 것도 없다. 아주 평범하다. 그래서 좀 아쉽다.';
  }

  state.story += '\n\n저장해서 분기 실험을 해보거나, 처음부터 다시 해서 다른 루트를 확인할 수 있다.';
  return true;
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  state.story = '저장 완료. 폰 브라우저에서도 이 정도면 제법 사람답게 산다.';
  render();
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    state.story = '저장된 데이터가 없다. 허공에 불러오기를 시전했다.';
    render();
    return;
  }

  state = JSON.parse(raw);
  state.story = '저장 데이터를 불러왔다. 다시 이어서 굴리면 된다.\n\n' + state.story;
  render();
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state = initialState();
  render();
}

saveBtn.addEventListener('click', saveGame);
loadBtn.addEventListener('click', loadGame);
resetBtn.addEventListener('click', resetGame);

render();
