export default class ListNode {
  prev = null;
  next = null;

  constructor(data) {
    this.data = data;
  }

  linkTo(node) {
    this.next = node;
    node.prev = this;
  }
}
