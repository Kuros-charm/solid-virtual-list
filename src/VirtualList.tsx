import { createMemo, createSignal, mergeProps, Index, Show, JSX, For } from 'solid-js';

function VirtualList(props: {
  height: number,
  itemHeight: number,
  dataSize: number,
  childrenTemplate: (props: {
    itemIdx: number,
    wrapperStyle: JSX.CSSProperties,
  }) => JSX.Element
}) {
  const mp = props;

  const [getPageStartIdx, setPageStartIdx] = createSignal(0);


  const pageSize = Math.ceil(mp.height / mp.itemHeight)
  const topBufferSize = 1
  const totalSize = pageSize + topBufferSize * 2



  /*
  There is always N number of rendered item on screen.
  When start, there are 0 to N-1 data rendered
  When user scroll down, the item rendering 0 will change to render N, 
  item rendering 1 will change to N + 1 etc.

  The only state changing is the rendering item idx of each element. (itemIdx)

  */
  const viewObjs = new Array(totalSize).fill(null).map((_, elementIdx) => {
    return {
      itemIdx: () => calculateItemIdx(getPageStartIdx(), elementIdx)
    }
  });





  /*
  PageStartIdx -> firstElementRenderItem, secondElementRenderItem, ...
  0 -> 0..29
  1 -> 30,1..29
  2 -> 30,31,..29



  */



  function handleOnScroll(scrollTop: number) {
    // scrollTop = (topBufferSize + pageStart) * itemHeight
    // => pageStart = (scrollTop / itemHeight) - topBufferSize
    const expectedStartIdx = Math.ceil(scrollTop / mp.itemHeight) - topBufferSize
    setPageStartIdx(Math.max(0, expectedStartIdx))

  }

  function calculateItemIdx(pageStartIdx: number, elementIdx: number) {
    // return a number x, where
    // x >= pageStartIdx , and
    // x % totalSize == elementIdx
    const idx = (elementIdx - pageStartIdx % totalSize + totalSize) % totalSize + pageStartIdx
    return idx

  }

  return <div style={{ height: `${mp.height}px`, "overflow-y": 'scroll' }} onScroll={e => handleOnScroll(e.target.scrollTop)}>
    <div style={{ height: `${mp.itemHeight * mp.dataSize}px`, position: 'relative' }}>
      <For each={viewObjs}>
        {(obj) => {

          return <Show
            when={obj.itemIdx() < mp.dataSize}  // to handle remaining element if near page end, another way is to prevent page start idx to reach page end but then new element will not immediate render after added to end
          >
            <mp.childrenTemplate
              itemIdx={obj.itemIdx()}
              wrapperStyle={{ height: `${mp.itemHeight}px`, width: '100%', position: 'absolute', transform: `translate(0px, ${(obj.itemIdx()) * mp.itemHeight}px)` }}
            />
          </Show>
        }}
      </For>

    </div>

  </div>

}


export default VirtualList