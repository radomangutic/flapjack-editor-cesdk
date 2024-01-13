import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('./EditorConfig'), {
  ssr: false
})

export default Editor;
