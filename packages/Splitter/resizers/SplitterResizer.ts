import { Component, property } from '@a11d/lit'
import { type Flex } from '@3mo/flex'

export abstract class SplitterResizer extends Component {
	@property({ type: String, reflect: true }) hostDirection?: Flex['direction']
	@property({ type: Boolean, reflect: true }) hostResizing = false
	@property({ type: Boolean, reflect: true }) hostHover = false
}