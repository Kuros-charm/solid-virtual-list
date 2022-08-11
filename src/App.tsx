import { Component, onCleanup } from 'solid-js';
import VirtualList from './VirtualList';
import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js';

const App: Component = () => {

  let id = 0;
  const [getStore, setStore] = createStore((new Array(30).fill(0).map((_, i) => { return { value: i + 1, id: id++ } })))

  const cellStates: {
    [itemIdx: number]: {
      focus: boolean,
      selectionStart: number,
      selectionEnd: number
    }
  } = {}


  function setCellState(itemIdx: number, updateObj: any) {
    cellStates[itemIdx] = Object.assign(cellStates[itemIdx] || {}, updateObj)
  }

  function onFocus(itemIdx: number, setSelection) {
    Object.keys(cellStates).forEach(k => setCellState(parseInt(k), { focus: false }));
    setCellState(itemIdx, { focus: true });
    document.addEventListener("selectionchange", setSelection);
    onCleanup(() => document.removeEventListener("selectionchange", setSelection));
  }

  function onBlur(itemIdx: number, setSelection) {
    setCellState(itemIdx, { focus: false, selectionStart: null, selectionEnd: null })
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
              const {
                focus,
                selectionStart,
                selectionEnd
              } = cellStates[props.itemIdx] || {}
              if (focus) {
                input?.focus({ preventScroll: true });
              } else {
                input?.blur();
              }
              if (selectionStart != null && selectionEnd != null) {
                input.setSelectionRange(selectionStart, selectionEnd)
              }
            })
            function saveSelection() {
              setCellState(props.itemIdx, {
                selectionStart: input.selectionStart,
                selectionEnd: input.selectionEnd
              })
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
