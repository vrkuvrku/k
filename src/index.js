// @ts-check

import './style';
// @ts-ignore
import { useRef, useEffect, useState } from 'preact/hooks'

const SIZE = 4

/** @type {number} */
let swipeX
/** @type {number} */
let swipeY

const SWIPE_MIN = 20

/*
function Canvas(props) {
	const canvasRef = useRef(null)
	const [width, setWidth] = useState(0)
	const [height, setHeight] = useState(0)
	const [board, setBoard] = useState([]) // SIZE*SIZE

	useEffect(() => {
		onResize()
		draw()
	}, [])

	const onResize = () => {
		setWidth(window.innerWidth)
		setHeight(window.innerHeight)
	}
	useEffect(() => {
		canvasRef.current.width = width
		canvasRef.current.height = height
		draw()
	}, [width, height])

	const draw = () => {
		const canvas = canvasRef.current
		const context = canvas.getContext('2d')
		//Our first draw
		context.fillStyle = '#000000'
		context.fillRect(0, 0, context.canvas.width, context.canvas.height)
		const side = (width > height ? height : width) / SIZE
		for (var x = 0; x < SIZE; x++)
			for (var y = 0; y < SIZE; y++) {
				context.fillStyle = 'lime'
				const posX = x * side + (width - SIZE * side) / 2
				const posY = y * side + (height - SIZE * side) / 2
				context.strokeStyle = 'lime';
				context.strokeRect(posX, posY, side, side)
				context.textBaseline = 'middle';
				context.textAlign = "center";
				context.font = Math.floor(side * .5) + 'px monospace';
				context.fillText("" + Math.pow(2, y + x), posX + side / 2, posY + side / 2, side)
			}
	}

	return <canvas ref={canvasRef} {...props} />
}
*/

function Board(p) {
	const onKeyPress = (/** @type {{ code: any; }} */ e) => {
		console.log("keyPress", e.code)
	}
	return (<table cellPadding="0" cellSpacing="0"
		onKeyPress={onKeyPress}
		style={{ backgroundColor: '#222' }}><tbody>
			<Row {...p} y={0} /><Row {...p} y={1} /><Row {...p} y={2} /><Row {...p} y={3} />
		</tbody>
	</table>)
}
function Row(p) {
	return (<tr><Col {...p} x={0} /><Col {...p} x={1} /><Col {...p} x={2} /><Col {...p} x={3} /></tr>)
}
function Col(p) {
	return <td className="tile"><Tile {...p} /></td>
}
function Tile(p) {
	const [side, setSide] = useState(40)
	useEffect(() => {
		const width = window.innerWidth
		const height = window.innerHeight
		setSide(Math.floor((width < height ? width : height) / SIZE))
	}, [])
	/** @type {number} */
	const n = p.board[SIZE * p.y + p.x]
	return <div className="tile" style={{
		width: side + 'px', height: side + 'px',
	}}>
		{n && <Number side={side} n={n} />}
	</div>
}

function Number({ n, side }) {
	const colors = [
		'#D35400',
		'#F39C12',
		'#27AE60',
		'#C0392B',
		'#1ABC9C',
		'#16A085',
		'#8E44AD',
		'#2980B9',
		'#9B59B6',
		'#E74C3C',
		'#2ECC71',
		'#F1C40F',
		'#E67E22',
		'#95A5A6'
	]

	return <div style={{
		margin: '4px', borderRadius: '4px',
		width: (side - 4 - 4) + 'px', height: (side - 4 - 4) + 'px',
		fontSize: Math.floor(side * .5) + 'px',
		fontFamily: 'monospace',
		backgroundColor: colors[n],
	}}>
		<div>{Math.pow(2, n - 1)}</div>
	</div>
}

function Game() {
	const [board, _setBoard] = useState([null, null, null, null, null, null, 1])
	const boardRef = useRef(board);
	const setBoard = (/** @type {number[]} */ board) => {
		boardRef.current = board;
		_setBoard(board);
	};
	const debug = (/** @type {number[]} */ copy) => {
		const ary = []
		for (let y = 0; y < SIZE; y++) {
			let row = []
			for (let x = 0; x < SIZE; x++) {
				const item = copy[SIZE * y + x]
				row.push(item ? Math.pow(2, item - 1) : '-')
			}
			ary.push("| " + row.join(" ") + " |")
		}
		console.log("+=========+\n" + ary.join("\n") + "\n+---------+")
	}

	/**
 * @param {[number]} copy
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} dirX
 * @param {number} dirY
 * @param {number} steps
 */
	const moveItem = (copy, fromX, fromY, dirX, dirY, steps) => {
		let n = copy[SIZE * fromY + fromX]
		let changed = false
		if (!n) return
		//console.log("moving", { n, fromX, fromY, dirX, dirY, steps })
		let newX = fromX, newY = fromY
		//debug(copy)
		for (var step = 0; step < steps; step++) {
			const oldX = newX, oldY = newY
			newX += dirX, newY += dirY
			const already = copy[SIZE * newY + newX]
			if (already) {
				if (already === n) {
					if (!changed) {
						n++
						changed = true
					} else {
						break
					}
				} else {
					break
				}
			}
			//console.log("moved ", { oldX, oldY, newX, newY })
			copy[SIZE * oldY + oldX] = undefined
			copy[SIZE * newY + newX] = n
			changed = true
			//debug(copy)
		}
	}
	/**
	 * 
	 * @param {[number]} copy 
	 * @param {number} dirX 
	 * @param {number} dirY 
	 */
	const moveItems = (copy, dirX, dirY) => {
		for (let a = 0; a < SIZE; a++) // independent
			for (let b = 0; b < SIZE; b++) { // stacking
				let x, y, steps;
				if (dirX > 0) {
					x = SIZE - b - 1, y = a
					steps = b - 1
				} else if (dirX < 0) {
					x = b, y = a
					steps = SIZE - b - 1
				} else if (dirY > 0) {
					x = a, y = SIZE - b - 1
					steps = b - 1
				} else if (dirY < 0) {
					x = a, y = b
					steps = SIZE - b - 1
				} else {
					throw Error('What??? dX=' + dirX + 'dY=' + dirY)
				}
				const n = copy[SIZE * y + x]
				///console.log("a=" + a + " b=" + b + ": item[" + x + "," + y + "] " +
				//	(n ? n : '-') + " [" + copy.join(" ") + "]")
				if (n) moveItem(copy, x, y, dirX, dirY, b)
			}
	}
	const placeNew = (/** @type {number[]} */ copy) => {
		let empty = []
		for (let y = 0; y < SIZE; y++) {
			for (let x = 0; x < SIZE; x++) {
				if (!copy[SIZE * y + x]) empty.push({ x, y })
			}
		}
		if (!empty.length) {
			alert("Game over!")
			// copy = placeNew([...copy])
		} else {
			const item = empty[Math.floor(Math.random() * empty.length)]
			copy[SIZE * item.y + item.x] = Math.random() > 0.5 ? 2 : 1
		}
		return copy
	}
	const step = (/** @type {number} */ dirX, /** @type {number} */ dirY) => {
		const copy = [...boardRef.current]
		// @ts-ignore
		moveItems(copy, dirX, dirY)
		placeNew(copy)
		setBoard([...copy])
	}
	useEffect(() => {
		window.addEventListener('touchstart', function (event) {
			swipeX = event.touches[0].pageX;
			swipeY = event.touches[0].pageY;
		});
		window.addEventListener('touchend', function (event) {
			var movedX = event.changedTouches[0].pageX - swipeX
			var movedY = event.changedTouches[0].pageY - swipeY
			if (Math.abs(movedX) > Math.abs(movedY)) {
				if (movedX > SWIPE_MIN) step(1, 0)
				else if (movedX < -SWIPE_MIN) step(-1, 0)
			} else {
				if (movedY > SWIPE_MIN) step(0, 1)
				else if (movedY < -SWIPE_MIN) step(0, -1)
			}
		});
		window.addEventListener('keyup', function (event) {
			//console.clear()
			console.log({ code: event.code })
			switch (event.code) {
				case 'ArrowRight': step(1, 0); break;
				case 'ArrowLeft': step(-1, 0); break;
				case 'ArrowUp': step(0, -1); break;
				case 'ArrowDown': step(0, 1); break;
			}
		}, false);
	}, [])
	console.log("board:")
	debug(board)
	return (<>
		<Board board={board} />
		{/*
		<br />
		<button onClick={() => step(-1, 0)}>Left</button>
		<button onClick={() => step(1, 0)}>Right</button>
		<button onClick={() => step(0, -1)}>Up</button>
		<button onClick={() => step(0, 1)}>Down</button>
		*/}
	</>)
}

export default function App() {
	return (
		<Game />
	);
}
