import { Component, onCleanup } from 'solid-js';
import VirtualList from './VirtualList';
import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js';

const App: Component = () => {

  let id = 0;
  const [getStore, setStore] = createStore((new Array(30).fill(0).map((_, i) => { return { value: i + 1, id: id++ } })))

  const uiState: {
    focusIdx: number,
    selectionStart: number,
    selectionEnd: number
  } = {
    focusIdx: null,
    selectionStart: null,
    selectionEnd: null
  }




  function onFocus(itemIdx: number, setSelection) {
    if (itemIdx !== uiState.focusIdx){
      // focus is caused by user, not by loading state
      console.log('user focused to ',itemIdx)
      uiState.focusIdx = itemIdx;
      uiState.selectionStart = null;
      uiState.selectionEnd = null;
    }
    document.addEventListener("selectionchange", setSelection);
    onCleanup(() => document.removeEventListener("selectionchange", setSelection));
  }

  function onBlur(itemIdx: number, setSelection) {
    if (itemIdx === uiState.focusIdx){
      // blur is caused by user, not by item moving out of window
      console.log('user blur')
      uiState.focusIdx = null;
      uiState.selectionStart = null;
      uiState.selectionEnd = null;
    }
    document.removeEventListener("selectionchange", setSelection)
  }

  return (
    <>
      <div style={{ 'max-width': '500px' }}>
        <VirtualList
          items={getStore}
          height={500}
          itemHeight={150}


          childrenTemplate={(props) => {
            let input: HTMLInputElement;
            createEffect(() => {
              if (uiState.focusIdx === props.itemIdx) {
                console.log(`back to focused item ${props.itemIdx}, load state`)
                input?.focus({ preventScroll: true });
                if (uiState.selectionStart !== null && uiState.selectionEnd !== null) {
                  input.setSelectionRange(uiState.selectionStart, uiState.selectionEnd)
                }
              } else {
                input?.blur();
              }
              
            })
            function saveSelection() {
              uiState.selectionStart = input.selectionStart;
              uiState.selectionEnd = input.selectionEnd;
            }

            return <span style={{
              ...props.wrapperStyle,
              //transition: 'transform  0.3s ease-in'
            }}>
              <div style={{ 'border': '1px solid', height: `148px` }}>
                <input ref={input}
                  value={props.item.value}
                  onInput={(e) => setStore(item => item.id === props.item.id, "value", () => (e.target as any).value)}
                  onFocus={() => onFocus(props.itemIdx, saveSelection)}
                  onBlur={() => onBlur(props.itemIdx, saveSelection)}
                />
              </div>
            </span>
          }} />

      </div>


      <input type="button" onclick={() => setStore([...getStore, { value: getStore.length + 1, id: id++ }])} value="push"></input>
      <input type="button" onclick={() => setStore([{ value: getStore.length + 1, id: id++ }, ...getStore])} value="unshift"></input>


    </>
  );
};

export default App;
