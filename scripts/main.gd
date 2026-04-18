extends Control

const END_DAY := 7

var state := {
	"day": 1,
	"knowledge": 0,
	"fitness": 0,
	"charm": 0,
	"stress": 0,
	"affection": 0,
	"flags": {
		"helped_her": false,
		"shared_dream": false
	}
}

@onready var status_label: RichTextLabel = $MarginContainer/VBox/Status
@onready var event_text: RichTextLabel = $MarginContainer/VBox/EventText
@onready var choices_box: VBoxContainer = $MarginContainer/VBox/Choices
@onready var study_button: Button = $MarginContainer/VBox/ActionButtons/StudyButton
@onready var workout_button: Button = $MarginContainer/VBox/ActionButtons/WorkOutButton
@onready var talk_button: Button = $MarginContainer/VBox/ActionButtons/TalkButton
@onready var rest_button: Button = $MarginContainer/VBox/ActionButtons/RestButton

func _ready() -> void:
	study_button.pressed.connect(_on_study)
	workout_button.pressed.connect(_on_workout)
	talk_button.pressed.connect(_on_talk)
	rest_button.pressed.connect(_on_rest)
	_refresh_ui("새 학기가 시작됐다. 일주일 동안 네 방향이 정해진다.")

func _refresh_ui(message: String) -> void:
	status_label.text = "[b]Day %d / %d[/b]\n지식: %d\n체력: %d\n매력: %d\n스트레스: %d\n호감도: %d" % [
		state.day, END_DAY, state.knowledge, state.fitness, state.charm, state.stress, state.affection
	]
	event_text.text = message
	_clear_choices()
	if state.day > END_DAY:
		_disable_actions(true)
		_show_ending()
		return
	_disable_actions(false)
	_check_mid_event()

func _disable_actions(disabled: bool) -> void:
	study_button.disabled = disabled
	workout_button.disabled = disabled
	talk_button.disabled = disabled
	rest_button.disabled = disabled

func _clear_choices() -> void:
	for child in choices_box.get_children():
		child.queue_free()

func _make_choice_button(label: String, callback: Callable) -> void:
	var button := Button.new()
	button.text = label
	button.pressed.connect(callback)
	choices_box.add_child(button)

func _advance_day(summary: String) -> void:
	state.day += 1
	_refresh_ui(summary)

func _on_study() -> void:
	state.knowledge += 2
	state.stress += 1
	if state.knowledge >= 4:
		state.charm += 1
	_advance_day("도서관에서 오래 버텼다. 머리는 차오르는데 어깨가 좀 굳는다.")

func _on_workout() -> void:
	state.fitness += 2
	state.stress = max(0, state.stress - 1)
	if state.fitness >= 4:
		state.charm += 1
	_advance_day("운동장을 돌고 나니 몸이 깨어난다. 보기보다 인간이 멀쩡해진다.")

func _on_talk() -> void:
	state.affection += 1
	state.charm += 1
	state.stress += 1
	_advance_day("그녀와 잡담을 나눴다. 사소한 대화였지만 표정이 조금 부드러워졌다.")

func _on_rest() -> void:
	state.stress = max(0, state.stress - 2)
	_advance_day("오늘은 숨을 골랐다. 세상도 가끔은 너를 안 괴롭힌다.")

func _check_mid_event() -> void:
	if state.day == 3 and not state.flags.helped_her:
		_disable_actions(true)
		event_text.text += "\n\n복도에서 그녀가 서류를 떨어뜨렸다."
		_make_choice_button("도와준다", func(): _resolve_help_event(true))
		_make_choice_button("지나친다", func(): _resolve_help_event(false))
	elif state.day == 5 and state.affection >= 2 and not state.flags.shared_dream:
		_disable_actions(true)
		event_text.text += "\n\n벤치에 앉은 그녀가 네 꿈이 뭐냐고 묻는다."
		_make_choice_button("솔직하게 말한다", func(): _resolve_dream_event(true))
		_make_choice_button("적당히 얼버무린다", func(): _resolve_dream_event(false))

func _resolve_help_event(helped: bool) -> void:
	_clear_choices()
	state.flags.helped_her = true
	if helped:
		state.affection += 2
		state.charm += 1
		event_text.text = "넌 서류를 주워 정리해줬다. 그녀는 예상보다 오래 너를 바라본다."
	else:
		state.affection = max(0, state.affection - 1)
		event_text.text = "그냥 지나쳤다. 편하긴 한데, 약간 좀 그렇지."
	_disable_actions(false)

func _resolve_dream_event(opened_up: bool) -> void:
	_clear_choices()
	state.flags.shared_dream = true
	if opened_up:
		state.affection += 2
		state.knowledge += 1
		event_text.text = "너는 진짜로 원하는 걸 말했다. 그녀는 처음으로 장난기 없이 웃었다."
	else:
		state.charm += 1
		event_text.text = "무난하게 넘겼다. 분위기는 유지됐지만 깊게 닿지는 않았다."
	_disable_actions(false)

func _show_ending() -> void:
	var result := ""
	if state.affection >= 5 and state.flags.helped_her and state.flags.shared_dream and state.knowledge + state.fitness >= 8:
		result = "[b]진엔딩 - 같은 방향[/b]\n서로를 잠깐 좋아한 정도가 아니다. 넌 네 삶도 붙들고, 그녀와의 거리도 줄였다."
	elif state.affection >= 4:
		result = "[b]호감 엔딩 - 다음 약속[/b]\n아직 시작 단계지만, 다음을 기대할 정도는 됐다. 나쁘지 않다."
	elif state.knowledge >= 6 or state.fitness >= 6:
		result = "[b]성장 엔딩 - 일단 너부터[/b]\n연애는 애매했지만, 적어도 너 자신은 전보다 훨씬 나아졌다."
	else:
		result = "[b]평범 엔딩 - 무난한 일주일[/b]\n크게 얻은 것도 잃은 것도 없다. 인간적으로는 좀 아쉽다."
	event_text.text = result + "\n\n원하면 이 구조 위에 세이브/로드, 다중 히로인, JSON 이벤트 시스템을 바로 확장하면 된다."
