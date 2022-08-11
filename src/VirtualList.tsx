import { createMemo, createSignal, mergeProps, Index, Show, JSX } from 'solid-js';

function VirtualList<T>(props: {
  height: number,
  itemHeight: number,
  items: T[],
  childrenTemplate: (props: {
    item:T,
    itemIdx: number,
    wrapperStyle: JSX.CSSProperties,
  }) => JSX.Element
}) {
  const mp = props;

  const [getPageStartIdx, setPageStartIdx] = createSignal(0);


  const pageSize = Math.ceil(mp.height / mp.itemHeight)
  const topBufferSize = 1
  const totalSize = pageSize + topBufferSize * 2


  const pageArray = new Array(totalSize).fill(null);

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
    <div style={{ height: `${mp.itemHeight * mp.items.length}px`, position: 'relative' }}>
      <Index each={pageArray}>
        {(_: any, elementIdx: number) => {

          const itemIdx = createMemo(() => calculateItemIdx(getPageStartIdx(), elementIdx))
          return <Show
            when={itemIdx() < mp.items.length}  // to handle remaining element if near page end, another way is to prevent page start idx to reach page end but then new element will not immediate render after added to end
          >
            <mp.childrenTemplate
              item={mp.items[itemIdx()]}
              itemIdx={itemIdx()}
              wrapperStyle={{ height: `${mp.itemHeight}px`, width: '100%', position: 'absolute', transform: `translate(0px, ${(itemIdx()) * mp.itemHeight}px)` }}
            />
          </Show>
        }}
      </Index>

    </div>

  </div>

}


export default VirtualList