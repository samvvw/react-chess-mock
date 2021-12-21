import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import './style.css'

function useDragNDrop() {
    const ref = useRef([])
    const targetRef = useRef([])
    const initialPosX = useRef()
    const initialPosY = useRef()
    const dragElement = useRef()
    const [direction, setDirection] = useState()
    const [color, setColor] = useState()

    const renderSquare = useCallback(
        (i) => {
            const x = i % 8
            const y = Math.floor(i / 8)

            return (
                <div
                    ref={(ele) => (targetRef.current[i] = ele)}
                    key={i}
                    style={{
                        backgroundColor: `${
                            (x + y) % 2 === 0 ? 'black' : 'white'
                        }`,
                        height: '50px',
                        width: '50px',
                        border: `${
                            color ? 'solid 1px purple' : 'solid 1px black'
                        }`,
                    }}
                >
                    {i === 2 ? (
                        <div
                            ref={(ele) => (ref.current[i] = ele)}
                            style={{
                                userSelect: 'none',
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        >
                            X:{x + 1} Y:{y + 1}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            )
        },
        [color]
    )

    const squares = useMemo(() => {
        const squares = []
        for (let i = 0; i < 64; i++) {
            squares.push(renderSquare(i))
        }
        return squares
    }, [renderSquare])

    function pieceCanMove(piece, canMove) {
        if (piece === 'knight') {
            console.log(initialPosX.current)
            console.log(initialPosY.current)
            setColor(true)
            for (let i = 0; i < 64; i++) {
                const toX = i % 8
                const toY = Math.floor(i / 8)

                if (
                    (Math.abs(initialPosX.current - toX) === 2 &&
                        Math.abs(initialPosY.current - toY) === 1) ||
                    (Math.abs(initialPosX.current - toX) === 1 &&
                        Math.abs(initialPosY.current - toY) === 2)
                ) {
                    canMove.push(i)
                }
            }
            console.log(canMove)
        }
    }
    useEffect(() => {
        const node = ref.current
        const targetNode = targetRef.current
        let cocolor
        const canMove = []

        if ((ref.current, targetRef.current)) {
            node.forEach((n) => {
                n.setAttribute('draggable', 'true')
                n.ondragstart = function (e) {
                    // e.preventDefault()
                    e.stopPropagation()
                    setTimeout(function () {
                        e.target.style.visibility = 'hidden'
                    }, 1)
                    initialPosX.current =
                        e.target.parentElement.dataset.dropBox.split('-')[1] % 8
                    initialPosY.current = Math.floor(
                        e.target.parentElement.dataset.dropBox.split('-')[1] / 8
                    )
                    n.style.backgroundColor = 'orange'
                    dragElement.current = e.target
                    targetNode.forEach(
                        (e) => (e.style.border = '1px solid yellow')
                    )

                    pieceCanMove('knight', canMove)
                    targetNode.forEach((t, index) => {
                        canMove.includes(index) &&
                            (t.style.backgroundColor = 'blue')
                    })
                    console.log(
                        e.target.parentElement.dataset.dropBox.split('-')[1]
                    )
                }
                n.ondrag = function (e) {
                    // e.preventDefault()
                    e.stopPropagation()
                }
                n.ondragend = function (e) {
                    e.preventDefault()
                    setTimeout(function () {
                        e.target.style.visibility = ''
                    }, 1)
                    setDirection('')
                    dragElement.current = null
                    n.style.backgroundColor = ''
                    targetNode.forEach(
                        (e) => (e.style.border = '1px solid black')
                    )
                    targetNode.forEach((t, i) => {
                        const x = i % 8
                        const y = Math.floor(i / 8)
                        t.style.backgroundColor = `${
                            (x + y) % 2 === 0 ? 'black' : 'white'
                        }`
                    })
                    setColor(false)
                    canMove.length = 0
                    console.log(canMove)
                }
            })

            targetNode.forEach((n, i) => {
                n.setAttribute('data-drop-box', `drop-${i}`)
                n.ondragover = function (e) {
                    console.log(canMove.includes(i))
                    if (canMove.includes(i)) {
                        e.preventDefault()
                        e.stopPropagation()
                        setDirection(
                            e.clientY < initialPosY.current ? 'Up' : 'Down'
                        )
                        if (e.target.style.backgroundColor !== 'green')
                            cocolor = e.target.style.backgroundColor
                        e.target.style.backgroundColor = 'green'
                    }
                }
                n.ondragleave = function (e) {
                    if (canMove.includes(i)) {
                        e.preventDefault()
                        e.stopPropagation()
                        e.target.style.backgroundColor = cocolor
                    }
                }
                n.ondrop = function (e) {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log(e.target)
                    console.log(e.target.dataset.dropBox.split('-')[1] % 8, 'X')

                    console.log(
                        Math.floor(e.target.dataset.dropBox.split('-')[1] / 8),
                        'Y'
                    )
                    const x = e.target.dataset.dropBox.split('-')[1] % 8
                    const y = Math.floor(
                        e.target.dataset.dropBox.split('-')[1] / 8
                    )

                    dragElement.current.innerText = `X:${x + 1} Y:${y + 1}`

                    e.target.style.backgroundColor = cocolor
                    if (!e.target.draggable && dragElement.current)
                        e.target.appendChild(dragElement.current)
                }
            })

            return () => {
                node.forEach((n) => {
                    n.ondragstart = null
                    n.drag = null
                    n.dragend = null
                })
                document.onmousemove = null
                setDirection('')
            }
        }
    }, [])
    return [ref, targetRef, direction, color, squares]
}

function App() {
    const [divref, targetRef, dir, color, squares] = useDragNDrop()

    return (
        <div className="App">
            <p>
                {JSON.stringify(color)}Updated...{dir}
            </p>
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row wrap',
                    height: '400px',
                    width: '400px',
                }}
            >
                {squares}
            </div>
        </div>
    )
}

export default App
