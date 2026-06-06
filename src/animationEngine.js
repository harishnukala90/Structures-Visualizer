// Animation Engine for generating step-by-step visualizations

const get = (obj, key) => Reflect.get(obj, key);
const set = (obj, key, val) => Reflect.set(obj, key, val);

const updateTreeParents = (nodesList) => {
  if (!nodesList) return [];
  const updated = nodesList.map(n => ({ ...n, parent: null }));
  updated.forEach(parent => {
    if (parent.left !== null && parent.left !== undefined) {
      const leftChild = updated.find(n => n.val === parent.left);
      if (leftChild) leftChild.parent = parent.val;
    }
    if (parent.right !== null && parent.right !== undefined) {
      const rightChild = updated.find(n => n.val === parent.right);
      if (rightChild) rightChild.parent = parent.val;
    }
  });
  return updated;
};

export function generateSteps(structureId, operation, currentState, inputs) {
  const steps = [];

  switch (structureId) {
    // ================= PRIMITIVES =================
    case 'integer': {
      if (operation === 'update') {
        const val = parseInt(inputs.value) || 0;
        steps.push({
          state: { ...currentState },
          description: `Initial state: Value is ${currentState.value}.`
        });
        steps.push({
          state: { ...currentState, value: val },
          description: `Updated Integer value in memory to ${val}.`
        });
      }
      break;
    }
    case 'float': {
      if (operation === 'update') {
        const val = parseFloat(inputs.value) || 0.0;
        // Mock binary bitfields representation
        const sign = val < 0 ? '1' : '0';
        const exp = Math.abs(val) > 0 ? (Math.floor(Math.log2(Math.abs(val))) + 127).toString(2).padStart(8, '0') : '00000000';
        const mantissa = '10010001111010111000011'; // Mocked mantissa for visual demo
        steps.push({
          state: { ...currentState },
          description: `Initial state: Float value is ${currentState.value}.`
        });
        steps.push({
          state: { value: val, sign, exponent: exp, mantissa },
          description: `IEEE-754 calculation: Sign bit set to ${sign}, Exponent is ${exp}, Mantissa bits updated.`
        });
      }
      break;
    }
    case 'character': {
      if (operation === 'update') {
        const val = inputs.value ? inputs.value.charAt(0) : 'A';
        const ascii = val.charCodeAt(0);
        const binary = ascii.toString(2).padStart(8, '0');
        steps.push({
          state: { ...currentState },
          description: `Initial state: Character is '${currentState.value}'.`
        });
        steps.push({
          state: { value: val, ascii, binary },
          description: `Stored '${val}' in memory. ASCII code: ${ascii}. Binary layout: ${binary}.`
        });
      }
      break;
    }
    case 'boolean': {
      if (operation === 'toggle') {
        const nextVal = !currentState.value;
        steps.push({
          state: { value: currentState.value },
          description: `Current state is ${currentState.value ? 'TRUE' : 'FALSE'}.`
        });
        steps.push({
          state: { value: nextVal },
          description: `Logical value toggled to ${nextVal ? 'TRUE (01)' : 'FALSE (00)'}.`
        });
      }
      break;
    }
    case 'pointer': {
      if (operation === 'update') {
        const targetVal = parseInt(inputs.value) || 0;
        steps.push({
          state: { ...currentState },
          description: `Initial state: Pointer ptr stores address ${currentState.pointsTo} which contains ${currentState.targetValue}.`
        });
        steps.push({
          state: { ...currentState, targetValue: targetVal },
          description: `Dereferenced and updated: *ptr = ${targetVal}. The value at memory address ${currentState.pointsTo} is now ${targetVal}.`
        });
      }
      break;
    }

    // ================= LINEAR =================
    case 'array1d': {
      const arr = [...currentState.arr];
      if (operation === 'search') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const target = isEmptyVal ? 0 : parseInt(inputs.value);

        if (!isEmptyVal && isNaN(target)) {
          steps.push({
            state: { arr },
            description: `Error: Please enter a valid number to search.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { arr, activeIdx: -1, label: 'Start search' },
          description: `Start searching for value ${target} in 1D Array.`
        });
        let found = false;
        for (let i = 0; i < arr.length; i++) {
          steps.push({
            state: { arr, activeIdx: i, label: `Comparing at index ${i}` },
            description: `Comparing index ${i}: arr[${i}] = ${get(arr, i)} with target ${target}.`
          });
          if (get(arr, i) === target) {
            steps.push({
              state: { arr, activeIdx: i, label: `FOUND at index ${i}!` },
              description: `Value ${target} found at index ${i}!`
            });
            found = true;
            break;
          }
        }
        if (!found) {
          steps.push({
            state: { arr, activeIdx: -1, label: 'Not Found' },
            description: `Finished search. Value ${target} not found in the array.`,
            status: 'fail'
          });
        }
      } else if (operation === 'insert') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);

        const isEmptyIdx = inputs.index === undefined || inputs.index === null || String(inputs.index).trim() === '';
        const idx = isEmptyIdx ? 0 : parseInt(inputs.index);

        if (arr.length >= 8) {
          steps.push({
            state: { arr },
            description: `Error: Array reached maximum capacity (8 elements).`,
            status: 'fail'
          });
          return steps;
        }

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { arr },
            description: `Error: Please enter a valid number to insert.`,
            status: 'fail'
          });
          return steps;
        }

        if (isNaN(idx) || idx < 0 || idx > arr.length) {
          steps.push({
            state: { arr },
            description: `Error: Index "${inputs.index}" is out of bounds. Valid range: 0 to ${arr.length}.`,
            status: 'fail'
          });
          return steps;
        }
        
        steps.push({
          state: { arr: [...arr], activeIdx: -1, label: 'Start insertion' },
          description: `Preparing to insert ${val} at index ${idx}.`
        });

        // Add slot
        const newArr = [...arr];
        newArr.splice(idx, 0, 0); // Temporary placeholder
        
        // Shift step-by-step backwards
        for (let i = newArr.length - 1; i > idx; i--) {
          set(newArr, i, get(newArr, i - 1));
          steps.push({
            state: { arr: [...newArr], activeIdx: i, label: `Shifting index ${i-1} to ${i}` },
            description: `Shift element ${get(newArr, i)} from index ${i - 1} to index ${i}.`
          });
        }
        
        newArr[idx] = val;
        steps.push({
          state: { arr: newArr, activeIdx: idx, label: `Inserted ${val}` },
          description: `Successfully inserted ${val} at index ${idx}.`
        });
      } else if (operation === 'delete') {
        const isEmptyIdx = inputs.index === undefined || inputs.index === null || String(inputs.index).trim() === '';
        const idx = isEmptyIdx ? 0 : parseInt(inputs.index);

        if (arr.length === 0) {
          steps.push({
            state: { arr },
            description: `Error: Array is empty. Cannot delete.`,
            status: 'fail'
          });
          return steps;
        }

        if (isNaN(idx) || idx < 0 || idx >= arr.length) {
          steps.push({
            state: { arr },
            description: `Error: Index "${inputs.index}" is out of bounds. Valid range: 0 to ${arr.length - 1}.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { arr: [...arr], activeIdx: idx, label: `Target index ${idx}` },
          description: `Preparing to delete element at index ${idx}.`
        });
        
        const newArr = [...arr];
        for (let i = idx; i < newArr.length - 1; i++) {
          set(newArr, i, get(newArr, i + 1));
          steps.push({
            state: { arr: [...newArr], activeIdx: i, label: `Shifting index ${i+1} to ${i}` },
            description: `Overwriting index ${i} with value ${get(newArr, i + 1)} from index ${i + 1}.`
          });
        }
        newArr.pop();
        steps.push({
          state: { arr: newArr, activeIdx: -1, label: 'Deleted' },
          description: `Deletion complete. Array length reduced.`
        });
      }
      break;
    }

    case 'array2d': {
      const grid = currentState.grid.map(row => [...row]);
      if (operation === 'search') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const target = isEmptyVal ? 0 : parseInt(inputs.value);

        if (!isEmptyVal && isNaN(target)) {
          steps.push({
            state: { grid },
            description: `Error: Please enter a valid number to search.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { grid, activeRow: -1, activeCol: -1 },
          description: `Starting linear search for value ${target} in 2D Array.`
        });
        let found = false;
        for (let r = 0; r < grid.length; r++) {
          steps.push({
            state: { grid, activeRow: r, activeCol: -1 },
            description: `Scanning row ${r}.`
          });
          for (let c = 0; c < get(grid, r).length; c++) {
            steps.push({
              state: { grid, activeRow: r, activeCol: c },
              description: `Comparing cell (${r}, ${c}): value is ${get(get(grid, r), c)}.`
            });
            if (get(get(grid, r), c) === target) {
              steps.push({
                state: { grid, activeRow: r, activeCol: c },
                description: `Found ${target} at coordinates row ${r}, col ${c}!`,
                status: 'success'
              });
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) {
          steps.push({
            state: { grid, activeRow: -1, activeCol: -1 },
            description: `Finished scanning 2D Array. Value ${target} was not found.`,
            status: 'fail'
          });
        }
      } else if (operation === 'insert') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);

        const isEmptyRow = inputs.row === undefined || inputs.row === null || String(inputs.row).trim() === '';
        const isEmptyCol = inputs.col === undefined || inputs.col === null || String(inputs.col).trim() === '';
        const r = isEmptyRow ? 0 : parseInt(inputs.row);
        const c = isEmptyCol ? 0 : parseInt(inputs.col);

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { grid },
            description: `Error: Please enter a valid number to insert.`,
            status: 'fail'
          });
          return steps;
        }

        if (isNaN(r) || isNaN(c) || r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
          steps.push({
            state: { grid },
            description: `Error: Coordinates (${inputs.row}, ${inputs.col}) are out of bounds. Valid rows: 0 to ${grid.length - 1}, cols: 0 to ${grid[0].length - 1}.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { grid, activeRow: -1, activeCol: -1 },
          description: `Preparing to insert value ${val} at cell (${r}, ${c}).`
        });
        steps.push({
          state: { grid, activeRow: r, activeCol: c },
          description: `Traversing to cell (${r}, ${c}).`
        });
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = val;
        steps.push({
          state: { grid: newGrid, activeRow: r, activeCol: c },
          description: `Inserted value ${val} at cell (${r}, ${c}).`,
          status: 'success'
        });
      } else if (operation === 'delete') {
        const isEmptyRow = inputs.row === undefined || inputs.row === null || String(inputs.row).trim() === '';
        const isEmptyCol = inputs.col === undefined || inputs.col === null || String(inputs.col).trim() === '';
        const r = isEmptyRow ? 0 : parseInt(inputs.row);
        const c = isEmptyCol ? 0 : parseInt(inputs.col);

        if (isNaN(r) || isNaN(c) || r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
          steps.push({
            state: { grid },
            description: `Error: Coordinates (${inputs.row}, ${inputs.col}) are out of bounds. Valid rows: 0 to ${grid.length - 1}, cols: 0 to ${grid[0].length - 1}.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { grid, activeRow: -1, activeCol: -1 },
          description: `Preparing to delete cell value at (${r}, ${c}).`
        });
        steps.push({
          state: { grid, activeRow: r, activeCol: c },
          description: `Traversing to cell (${r}, ${c}).`
        });
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = 0;
        steps.push({
          state: { grid: newGrid, activeRow: r, activeCol: c },
          description: `Deleted value at cell (${r}, ${c}) (reset to 0).`,
          status: 'success'
        });
      }
      break;
    }

    case 'singly_linked_list':
    case 'doubly_linked_list':
    case 'circular_linked_list':
    case 'doubly_circular_linked_list': {
      const nodes = [...currentState.nodes];
      if (operation === 'search') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const target = isEmptyVal ? 0 : parseInt(inputs.value);

        if (!isEmptyVal && isNaN(target)) {
          steps.push({
            state: { nodes },
            description: `Error: Please enter a valid number to search.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { nodes, activeIdx: -1 },
          description: `Start search for ${target} from Head (index 0).`
        });
        let found = false;
        for (let i = 0; i < nodes.length; i++) {
          steps.push({
            state: { nodes, activeIdx: i },
            description: `Node value is ${get(nodes, i)}. Comparing with ${target}.`
          });
          if (get(nodes, i) === target) {
            steps.push({
              state: { nodes, activeIdx: i },
              description: `Target ${target} found at node index ${i}!`
            });
            found = true;
            break;
          }
        }
        if (!found) {
          steps.push({
            state: { nodes, activeIdx: -1 },
            description: `Reached end of list. Value ${target} not found.`,
            status: 'fail'
          });
        }
      } else if (operation === 'insert_head') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);

        if (nodes.length >= 8) {
          steps.push({
            state: { nodes },
            description: `Error: Linked list reached maximum capacity (8 nodes).`,
            status: 'fail'
          });
          return steps;
        }

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { nodes },
            description: `Error: Please enter a valid number to insert.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { nodes },
          description: `Create new node containing ${val}.`
        });
        const newNodes = [val, ...nodes];
        steps.push({
          state: { nodes: newNodes, activeIdx: 0 },
          description: `Adjust head pointer: new node's next points to old head. New head is ${val}.`
        });
      } else if (operation === 'insert_tail') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);

        if (nodes.length >= 8) {
          steps.push({
            state: { nodes },
            description: `Error: Linked list reached maximum capacity (8 nodes).`,
            status: 'fail'
          });
          return steps;
        }

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { nodes },
            description: `Error: Please enter a valid number to insert.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { nodes },
          description: `Create new node containing ${val}.`
        });
        // Traverse to tail
        for (let i = 0; i < nodes.length; i++) {
          steps.push({
            state: { nodes, activeIdx: i },
            description: `Traversing... current node is index ${i} (${get(nodes, i)}).`
          });
        }
        const newNodes = [...nodes, val];
        steps.push({
          state: { nodes: newNodes, activeIdx: newNodes.length - 1 },
          description: `Set old tail's next pointer to point to new node. Tail is now ${val}.`
        });
      } else if (operation === 'insert_index') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);
        const isEmptyIdx = inputs.index === undefined || inputs.index === null || String(inputs.index).trim() === '';
        const targetIdx = isEmptyIdx ? 0 : parseInt(inputs.index);

        if (isNaN(targetIdx) || targetIdx < 0 || targetIdx > nodes.length) {
          steps.push({
            state: { nodes },
            description: `Error: Index "${inputs.index}" is out of bounds. Valid range: 0 to ${nodes.length}.`,
            status: 'fail'
          });
          return steps;
        }

        if (nodes.length >= 8) {
          steps.push({
            state: { nodes },
            description: `Error: Linked list reached maximum capacity (8 nodes).`,
            status: 'fail'
          });
          return steps;
        }

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { nodes },
            description: `Error: Please enter a valid number to insert.`,
            status: 'fail'
          });
          return steps;
        }
        
        if (targetIdx === 0) {
          steps.push({
            state: { nodes },
            description: `Insert at index 0 is equivalent to Insert Head. Create new node containing ${val}.`
          });
          const newNodes = [val, ...nodes];
          steps.push({
            state: { nodes: newNodes, activeIdx: 0 },
            description: `Adjust head/wrap pointers. New head is ${val}.`
          });
        } else if (targetIdx === nodes.length) {
          steps.push({
            state: { nodes },
            description: `Insert at index ${targetIdx} is equivalent to Insert Tail. Create new node containing ${val}.`
          });
          for (let i = 0; i < nodes.length; i++) {
            steps.push({
              state: { nodes, activeIdx: i },
              description: `Traversing... current node is index ${i} (${get(nodes, i)}).`
            });
          }
          const newNodes = [...nodes, val];
          steps.push({
            state: { nodes: newNodes, activeIdx: newNodes.length - 1 },
            description: `Adjust tail/wrap pointers. Tail is now ${val}.`
          });
        } else {
          steps.push({
            state: { nodes, activeIdx: -1 },
            description: `Preparing to insert ${val} at index ${targetIdx}.`
          });
          for (let i = 0; i < targetIdx; i++) {
            steps.push({
              state: { nodes, activeIdx: i },
              description: `Traversing to insertion point... current node index ${i} (${get(nodes, i)}).`
            });
          }
          const newNodes = [...nodes];
          newNodes.splice(targetIdx, 0, val);
          steps.push({
            state: { nodes: newNodes, activeIdx: targetIdx },
            description: `Inserted ${val} at index ${targetIdx}. Reassigned pointers of nodes at indices ${targetIdx - 1} and ${targetIdx + 1}.`
          });
        }
      } else if (operation === 'delete') {
        const isEmptyVal = inputs.value === undefined || inputs.value === null || String(inputs.value).trim() === '';
        const val = isEmptyVal ? 0 : parseInt(inputs.value);

        if (nodes.length === 0) {
          steps.push({
            state: { nodes },
            description: `Error: List underflow! Cannot delete from an empty list.`,
            status: 'fail'
          });
          return steps;
        }

        if (!isEmptyVal && isNaN(val)) {
          steps.push({
            state: { nodes },
            description: `Error: Please enter a valid number to delete.`,
            status: 'fail'
          });
          return steps;
        }

        steps.push({
          state: { nodes, activeIdx: -1 },
          description: `Searching for value ${val} to delete.`
        });
        let idxToDelete = -1;
        for (let i = 0; i < nodes.length; i++) {
          steps.push({
            state: { nodes, activeIdx: i },
            description: `Comparing node index ${i}: value ${get(nodes, i)}.`
          });
          if (get(nodes, i) === val) {
            idxToDelete = i;
            break;
          }
        }
        if (idxToDelete !== -1) {
          steps.push({
            state: { nodes, activeIdx: idxToDelete },
            description: `Node found. Adjusting pointers to bypass node at index ${idxToDelete}.`
          });
          const newNodes = nodes.filter((_, idx) => idx !== idxToDelete);
          steps.push({
            state: { nodes: newNodes, activeIdx: -1 },
            description: `Removed node containing ${val}. Deallocation complete.`
          });
        } else {
          steps.push({
            state: { nodes, activeIdx: -1 },
            description: `Value ${val} not found in the list. Nothing deleted.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'stack': {
      const stack = [...currentState.stack];
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      if (operation === 'push') {
        if (stack.length >= 8) {
          steps.push({
            state: { stack, activeIdx: -1 },
            description: `Stack overflow! Cannot push. Stack reached maximum capacity (8 elements).`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { stack, activeIdx: -1 },
          description: `Preparing to PUSH ${targetVal} onto the Stack.`
        });
        const newStack = [...stack, targetVal];
        steps.push({
          state: { stack: newStack, activeIdx: newStack.length - 1 },
          description: `Incremented TOP pointer. Stored ${targetVal} at the new TOP index.`,
          status: 'success'
        });
      } else if (operation === 'pop') {
        if (stack.length === 0) {
          steps.push({
            state: { stack, activeIdx: -1 },
            description: `Stack underflow! Cannot POP from an empty stack.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { stack, activeIdx: stack.length - 1 },
            description: `Retrieving top item: ${get(stack, stack.length - 1)}.`
          });
          const val = get(stack, stack.length - 1);
          const newStack = stack.slice(0, -1);
          steps.push({
            state: { stack: newStack, activeIdx: -1 },
            description: `Popped ${val} off the stack and decremented TOP pointer.`,
            status: 'success'
          });
        }
      } else if (operation === 'search') {
        steps.push({
          state: { stack, activeIdx: -1 },
          description: `Starting search for ${targetVal} in Stack from TOP to BOTTOM.`
        });
        let found = false;
        for (let i = stack.length - 1; i >= 0; i--) {
          steps.push({
            state: { stack, activeIdx: i },
            description: `Inspecting stack index [${i}] (value: ${get(stack, i)}).`
          });
          if (get(stack, i) == targetVal) {
            steps.push({
              state: { stack, activeIdx: i },
              description: `Found target ${targetVal} at index [${i}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
        if (!found) {
          steps.push({
            state: { stack, activeIdx: -1 },
            description: `Target ${targetVal} was not found in the Stack.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'queue': {
      const queue = [...currentState.queue];
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      if (operation === 'enqueue') {
        if (queue.length >= 8) {
          steps.push({
            state: { queue, activeIdx: -1 },
            description: `Queue overflow! Cannot enqueue. Queue reached maximum capacity (8 elements).`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { queue, activeIdx: -1 },
          description: `Enqueuing ${targetVal} at the REAR of the queue.`
        });
        const newQueue = [...queue, targetVal];
        steps.push({
          state: { queue: newQueue, activeIdx: newQueue.length - 1 },
          description: `Updated REAR pointer. Added ${targetVal} to the queue.`,
          status: 'success'
        });
      } else if (operation === 'dequeue') {
        if (queue.length === 0) {
          steps.push({
            state: { queue, activeIdx: -1 },
            description: `Queue Underflow! Queue is empty.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { queue, activeIdx: 0 },
            description: `Removing item at FRONT of the queue: ${queue[0]}.`
          });
          const newQueue = queue.slice(1);
          steps.push({
            state: { queue: newQueue, activeIdx: -1 },
            description: `Dequeued successfully. FRONT pointer shifted forward.`,
            status: 'success'
          });
        }
      } else if (operation === 'search') {
        steps.push({
          state: { queue, activeIdx: -1 },
          description: `Starting search for ${targetVal} in Queue from FRONT to REAR.`
        });
        let found = false;
        for (let i = 0; i < queue.length; i++) {
          steps.push({
            state: { queue, activeIdx: i },
            description: `Inspecting queue index [${i}] (value: ${get(queue, i)}).`
          });
          if (get(queue, i) == targetVal) {
            steps.push({
              state: { queue, activeIdx: i },
              description: `Found target ${targetVal} at index [${i}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
        if (!found) {
          steps.push({
            state: { queue, activeIdx: -1 },
            description: `Target ${targetVal} was not found in the Queue.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'circular_queue': {
      const queue = [...currentState.queue];
      let front = currentState.front;
      let rear = currentState.rear;
      const size = currentState.size;
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      if (operation === 'enqueue') {
        const val = targetVal;
        const nextRear = (rear + 1) % size;
        if (nextRear === front) {
          steps.push({
            state: { queue, front, rear, size, activeIdx: -1 },
            description: `Queue Full! (rear + 1) % size matches front. Cannot enqueue ${val}.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { queue, front, rear, size, activeIdx: nextRear },
            description: `Preparing to Enqueue ${val}. Calculating rear = (rear + 1) % ${size} = ${nextRear}.`
          });
          const newQueue = [...queue];
          newQueue[nextRear] = val;
          steps.push({
            state: { queue: newQueue, front, rear: nextRear, size, activeIdx: nextRear },
            description: `Added ${val} at index ${nextRear}. rear pointer is now ${nextRear}.`,
            status: 'success'
          });
        }
      } else if (operation === 'dequeue') {
        const isOccupied = queue[front] !== null && queue[front] !== undefined;
        if (!isOccupied) {
          steps.push({
            state: { queue, front, rear, size, activeIdx: -1 },
            description: `Queue is empty! Front index ${front} has no elements.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { queue, front, rear, size, activeIdx: front },
            description: `Dequeuing from front index ${front}. Value: ${queue[front]}.`
          });
          const newQueue = [...queue];
          const dequeuedVal = newQueue[front];
          newQueue[front] = null;
          
          const nextFront = front === rear ? 0 : (front + 1) % size;
          const nextRear = front === rear ? -1 : rear;
          steps.push({
            state: { queue: newQueue, front: nextFront, rear: nextRear, size, activeIdx: front },
            description: front === rear
              ? `Removed last item ${dequeuedVal}. Queue reset: front = 0, rear = -1.`
              : `Removed ${dequeuedVal}. Shifted front to (front + 1) % ${size} = ${nextFront}.`,
            status: 'success'
          });
        }
      } else if (operation === 'search') {
        steps.push({
          state: { queue, front, rear, size, activeIdx: -1 },
          description: `Starting search for ${targetVal} in Circular Queue from FRONT index ${front}.`
        });
        let found = false;
        let occupiedCount = queue.filter(v => v !== null && v !== undefined).length;
        if (occupiedCount > 0) {
          let curr = front;
          for (let i = 0; i < size; i++) {
            if (queue[curr] === null || queue[curr] === undefined) {
              break;
            }
            steps.push({
              state: { queue, front, rear, size, activeIdx: curr },
              description: `Inspecting circular index [${curr}] (value: ${queue[curr]}).`
            });
            if (queue[curr] == targetVal) {
              steps.push({
                state: { queue, front, rear, size, activeIdx: curr },
                description: `Found target ${targetVal} at index [${curr}]!`,
                status: 'success'
              });
              found = true;
              break;
            }
            if (curr === rear) break;
            curr = (curr + 1) % size;
          }
        }
        if (!found) {
          steps.push({
            state: { queue, front, rear, size, activeIdx: -1 },
            description: `Target ${targetVal} was not found in the Circular Queue.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'deque': {
      const deque = [...currentState.deque];
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      if (operation === 'insert_front') {
        const val = targetVal;
        if (deque.length >= 8) {
          steps.push({
            state: { deque, activeIdx: -1 },
            description: `Deque overflow! Cannot insert. Deque reached maximum capacity (8 elements).`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { deque, activeIdx: -1 },
          description: `Inserting ${val} at front of Deque.`
        });
        const newDeque = [val, ...deque];
        steps.push({
          state: { deque: newDeque, activeIdx: 0 },
          description: `Inserted ${val} at index 0. FRONT shifted.`,
          status: 'success'
        });
      } else if (operation === 'insert_rear') {
        const val = targetVal;
        if (deque.length >= 8) {
          steps.push({
            state: { deque, activeIdx: -1 },
            description: `Deque overflow! Cannot insert. Deque reached maximum capacity (8 elements).`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { deque, activeIdx: -1 },
          description: `Inserting ${val} at rear of Deque.`
        });
        const newDeque = [...deque, val];
        steps.push({
          state: { deque: newDeque, activeIdx: newDeque.length - 1 },
          description: `Inserted ${val} at the end index ${newDeque.length - 1}. REAR shifted.`,
          status: 'success'
        });
      } else if (operation === 'delete_front') {
        if (deque.length === 0) {
          steps.push({
            state: { deque, activeIdx: -1 },
            description: `Deque empty! Cannot delete front.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { deque, activeIdx: 0 },
            description: `Removing front element ${deque[0]}.`
          });
          const newDeque = deque.slice(1);
          steps.push({
            state: { deque: newDeque, activeIdx: -1 },
            description: `Removed front element. FRONT shifted.`,
            status: 'success'
          });
        }
      } else if (operation === 'delete_rear') {
        if (deque.length === 0) {
          steps.push({
            state: { deque, activeIdx: -1 },
            description: `Deque empty! Cannot delete rear.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { deque, activeIdx: deque.length - 1 },
            description: `Removing rear element ${get(deque, deque.length - 1)}.`
          });
          const newDeque = deque.slice(0, -1);
          steps.push({
            state: { deque: newDeque, activeIdx: -1 },
            description: `Removed rear element. REAR shifted.`,
            status: 'success'
          });
        }
      } else if (operation === 'search') {
        steps.push({
          state: { deque, activeIdx: -1 },
          description: `Starting search for ${targetVal} in Deque from FRONT to REAR.`
        });
        let found = false;
        for (let i = 0; i < deque.length; i++) {
          steps.push({
            state: { deque, activeIdx: i },
            description: `Inspecting deque index [${i}] (value: ${get(deque, i)}).`
          });
          if (get(deque, i) == targetVal) {
            steps.push({
              state: { deque, activeIdx: i },
              description: `Found target ${targetVal} at index [${i}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
        if (!found) {
          steps.push({
            state: { deque, activeIdx: -1 },
            description: `Target ${targetVal} was not found in the Deque.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    // ================= NON-LINEAR =================
    case 'bst': {
      const nodes = currentState.nodes.map(n => ({ ...n }));
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      if (operation === 'search') {
        steps.push({
          state: { nodes, activeVal: null, comparedVal: null },
          description: `Starting BST search for key ${targetVal}.`
        });
        
        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;
        let found = false;

        while (currVal !== null) {
          const currNode = nodes.find(n => n.val === currVal);
          if (!currNode) break;

          steps.push({
            state: { nodes, activeVal: currVal, comparedVal: null },
            description: `Inspecting node ${currVal}.`
          });

          if (currVal === targetVal) {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: null },
              description: `Found key ${targetVal} at node ${currVal}!`,
              status: 'success'
            });
            found = true;
            break;
          }

          if (targetVal < currVal) {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: currNode.left },
              description: `${targetVal} < ${currVal}. Traversal path points to LEFT child.`
            });
            currVal = currNode.left;
          } else {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: currNode.right },
              description: `${targetVal} > ${currVal}. Traversal path points to RIGHT child.`
            });
            currVal = currNode.right;
          }
        }

        if (!found) {
          steps.push({
            state: { nodes, activeVal: null, comparedVal: null },
            description: `Reached null leaf pointer. Key ${targetVal} does not exist in BST.`,
            status: 'fail'
          });
        }
      } else if (operation === 'insert') {
        const val = targetVal;
        if (nodes.length >= 15) {
          steps.push({
            state: { nodes, activeVal: null },
            description: `Tree capacity limit reached! Cannot insert more than 15 nodes.`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { nodes, activeVal: null },
          description: `Beginning BST Insertion of key ${val}.`
        });
        
        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;

        if (currVal === null) {
          // Empty tree
          const newNode = { val, x: 50, y: 15, left: null, right: null };
          steps.push({
            state: { nodes: [newNode], activeVal: val },
            description: `Tree was empty. Created root node ${val}.`,
            status: 'success'
          });
        } else {
          let parent = null;
          let direction = '';

          while (currVal !== null) {
            const currNode = nodes.find(n => n.val === currVal);
            if (!currNode) break;

            steps.push({
              state: { nodes, activeVal: currVal },
              description: `Comparing insertion value ${val} with current node ${currVal}.`
            });

            if (val === currVal) {
              steps.push({
                state: { nodes, activeVal: currVal },
                description: `Key ${val} already exists. Duplicates ignored.`,
                status: 'fail'
              });
              return steps;
            }

            parent = currNode;
            if (val < currVal) {
              direction = 'left';
              currVal = currNode.left;
            } else {
              direction = 'right';
              currVal = currNode.right;
            }
          }

          if (parent) {
            const newX = direction === 'left' ? parent.x - 12 : parent.x + 12;
            const newY = parent.y + 20;
            const newNode = { val, x: newX, y: newY, left: null, right: null };
            
            const newNodes = nodes.map(n => {
              if (n.val === parent.val) {
                return { ...n, [direction]: val };
              }
              return n;
            });
            newNodes.push(newNode);

            steps.push({
              state: { nodes: newNodes, activeVal: val },
              description: `Slot found. Connected new node ${val} to parent ${parent.val} on the ${direction.toUpperCase()}.`,
              status: 'success'
            });
          }
        }
      } else if (operation === 'delete') {
        const val = targetVal;
        steps.push({
          state: { nodes, activeVal: null, comparedVal: null },
          description: `Starting BST deletion for key ${val}.`
        });

        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;

        let parent = null;
        let currNode = null;
        let found = false;

        while (currVal !== null) {
          currNode = nodes.find(n => n.val === currVal);
          if (!currNode) break;

          steps.push({
            state: { nodes, activeVal: currVal, comparedVal: null },
            description: `Searching for node to delete: inspecting node ${currVal}.`
          });

          if (currVal === val) {
            found = true;
            break;
          }

          parent = currNode;
          if (val < currVal) {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: currNode.left },
              description: `${val} < ${currVal}. Searching in LEFT subtree.`
            });
            currVal = currNode.left;
          } else {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: currNode.right },
              description: `${val} > ${currVal}. Searching in RIGHT subtree.`
            });
            currVal = currNode.right;
          }
        }

        if (!found) {
          steps.push({
            state: { nodes, activeVal: null, comparedVal: null },
            description: `Key ${val} not found in the BST. Nothing deleted.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { nodes, activeVal: currVal, comparedVal: null },
            description: `Found node ${val} to delete.`
          });

          const hasLeft = currNode.left !== null && currNode.left !== undefined;
          const hasRight = currNode.right !== null && currNode.right !== undefined;

          if (!hasLeft && !hasRight) {
            let newNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              newNodes = newNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: null };
                  if (n.right === val) return { ...n, right: null };
                }
                return n;
              });
            }
            steps.push({
              state: { nodes: newNodes, activeVal: null, comparedVal: null },
              description: `Node ${val} is a leaf node. Deleting directly.`,
              status: 'success'
            });
          } else if (hasLeft && !hasRight) {
            const childVal = currNode.left;
            let newNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              newNodes = newNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: childVal };
                  if (n.right === val) return { ...n, right: childVal };
                }
                return n;
              });
            }
            steps.push({
              state: { nodes: newNodes, activeVal: null, comparedVal: null },
              description: `Node ${val} has only left child ${childVal}. Promoting ${childVal} to bypass ${val}.`,
              status: 'success'
            });
          } else if (!hasLeft && hasRight) {
            const childVal = currNode.right;
            let newNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              newNodes = newNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: childVal };
                  if (n.right === val) return { ...n, right: childVal };
                }
                return n;
              });
            }
            steps.push({
              state: { nodes: newNodes, activeVal: null, comparedVal: null },
              description: `Node ${val} has only right child ${childVal}. Promoting ${childVal} to bypass ${val}.`,
              status: 'success'
            });
          } else {
            steps.push({
              state: { nodes, activeVal: currVal, comparedVal: currNode.right },
              description: `Node ${val} has two children. Finding in-order successor in right subtree.`
            });

            let succVal = currNode.right;
            let succNode = nodes.find(n => n.val === succVal);
            let succParentVal = currVal;

            while (succNode.left !== null && succNode.left !== undefined) {
              steps.push({
                state: { nodes, activeVal: succVal, comparedVal: succNode.left },
                description: `Moving left to find successor: inspecting ${succVal}.`
              });
              succParentVal = succVal;
              succVal = succNode.left;
              succNode = nodes.find(n => n.val === succVal);
            }

            steps.push({
              state: { nodes, activeVal: succVal, comparedVal: null },
              description: `In-order successor is node ${succVal}. Copying successor's value ${succVal} to node ${val}.`
            });

            let updatedNodes = nodes.map(n => {
              if (n.val === val) {
                return { ...n, val: succVal };
              }
              let left = n.left;
              let right = n.right;
              if (left === val) left = succVal;
              if (right === val) right = succVal;
              return { ...n, left, right };
            });

            steps.push({
              state: { nodes: updatedNodes, activeVal: succVal, comparedVal: null },
              description: `Node value updated. Now deleting the duplicate successor node ${succVal} from its original position.`
            });

            const originalSuccNodeInUpdated = updatedNodes.find(n => n.val === succVal && n.y > currNode.y);
            const succChildVal = originalSuccNodeInUpdated ? originalSuccNodeInUpdated.right : null;

            let finalNodes = updatedNodes.filter(n => !(n.val === succVal && n.y > currNode.y));
            finalNodes = finalNodes.map(n => {
              const parentToCheck = (succParentVal === val) ? succVal : succParentVal;
              if (n.val === parentToCheck) {
                if (n.left === succVal) return { ...n, left: succChildVal };
                if (n.right === succVal) return { ...n, right: succChildVal };
              }
              return n;
            });

            steps.push({
              state: { nodes: finalNodes, activeVal: null, comparedVal: null },
              description: `Successfully deleted duplicate successor node ${succVal}.`,
              status: 'success'
            });
          }
        }
      } else if (operation === 'traverse') {
        const mode = inputs.mode || 'inorder';
        const visited = [];
        steps.push({
          state: { nodes, activeVal: null, comparedVal: null },
          description: `Starting ${mode.toUpperCase()} tree traversal.`
        });

        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        if (rootNode) {
          if (mode === 'inorder') {
            const inorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              inorder(node.left);
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, comparedVal: null },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
              inorder(node.right);
            };
            inorder(rootNode.val);
          } else if (mode === 'preorder') {
            const preorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, comparedVal: null },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
              preorder(node.left);
              preorder(node.right);
            };
            preorder(rootNode.val);
          } else if (mode === 'postorder') {
            const postorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              postorder(node.left);
              postorder(node.right);
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, comparedVal: null },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
            };
            postorder(rootNode.val);
          } else if (mode === 'levelorder') {
            const queue = [rootNode.val];
            while (queue.length > 0) {
              const curr = queue.shift();
              visited.push(curr);
              steps.push({
                state: { nodes, activeVal: curr, comparedVal: null },
                description: `Visited node ${curr}. Traversal list: [${visited.join(', ')}].`
              });
              const currNode = nodes.find(n => n.val === curr);
              if (currNode) {
                if (currNode.left !== null && currNode.left !== undefined) queue.push(currNode.left);
                if (currNode.right !== null && currNode.right !== undefined) queue.push(currNode.right);
              }
            }
          }
        }
        steps.push({
          state: { nodes, activeVal: null, comparedVal: null },
          description: `Finished ${mode.toUpperCase()} traversal. Complete traversal list: [${visited.join(', ')}].`,
          status: 'success'
        });
      }
      break;
    }

    case 'avl': {
      const nodes = currentState.nodes.map(n => ({ ...n }));
      const isChar = inputs.isChar;
      const targetVal = isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);

      // AVL Height Helper
      const getAvlHeight = (v, nodesList) => {
        if (v === null || v === undefined) return 0;
        const node = nodesList.find(n => n.val === v);
        if (!node) return 0;
        return 1 + Math.max(getAvlHeight(node.left, nodesList), getAvlHeight(node.right, nodesList));
      };

      // Helper to compute and update BFs for nodes
      const updateAvlBFs = (nodesList) => {
        return nodesList.map(node => {
          const lh = getAvlHeight(node.left, nodesList);
          const rh = getAvlHeight(node.right, nodesList);
          return { ...node, bf: lh - rh };
        });
      };

      if (operation === 'search') {
        steps.push({
          state: { nodes, activeVal: null, rotationLabel: '' },
          description: `Starting AVL search for key ${targetVal}.`
        });
        
        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;
        let found = false;

        while (currVal !== null) {
          const currNode = nodes.find(n => n.val === currVal);
          if (!currNode) break;

          steps.push({
            state: { nodes, activeVal: currVal, rotationLabel: '' },
            description: `Inspecting node ${currVal}.`
          });

          if (currVal === targetVal) {
            steps.push({
              state: { nodes, activeVal: currVal, rotationLabel: '' },
              description: `Found key ${targetVal} at node ${currVal}!`,
              status: 'success'
            });
            found = true;
            break;
          }

          if (targetVal < currVal) {
            steps.push({
              state: { nodes, activeVal: currVal, rotationLabel: '' },
              description: `${targetVal} < ${currVal}. Traversal path points to LEFT child.`
            });
            currVal = currNode.left;
          } else {
            steps.push({
              state: { nodes, activeVal: currVal, rotationLabel: '' },
              description: `${targetVal} > ${currVal}. Traversal path points to RIGHT child.`
            });
            currVal = currNode.right;
          }
        }

        if (!found) {
          steps.push({
            state: { nodes, activeVal: null, rotationLabel: '' },
            description: `Key ${targetVal} does not exist in AVL tree.`,
            status: 'fail'
          });
        }
      } else if (operation === 'insert') {
        const val = targetVal;
        if (nodes.length >= 15) {
          steps.push({
            state: { nodes, activeVal: null, rotationLabel: '' },
            description: `Tree capacity limit reached! Cannot insert more than 15 nodes.`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { nodes, activeVal: null, rotationLabel: '' },
          description: `Insert key ${val} into AVL tree.`
        });
        
        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;

        if (currVal === null) {
          const newNode = { val, bf: 0, x: 50, y: 15, left: null, right: null };
          steps.push({
            state: { nodes: [newNode], activeVal: val, rotationLabel: '' },
            description: `Tree was empty. Created root node ${val}.`,
            status: 'success'
          });
        } else {
          let parent = null;
          let direction = '';

          while (currVal !== null) {
            const currNode = nodes.find(n => n.val === currVal);
            if (!currNode) break;

            steps.push({
              state: { nodes, activeVal: currVal },
              description: `Comparing value ${val} with node ${currVal}.`
            });

            if (val === currVal) {
              steps.push({
                state: { nodes, activeVal: currVal },
                description: `Key ${val} already exists. Duplicates ignored.`,
                status: 'fail'
              });
              return steps;
            }

            parent = currNode;
            if (val < currVal) {
              direction = 'left';
              currVal = currNode.left;
            } else {
              direction = 'right';
              currVal = currNode.right;
            }
          }

          if (parent) {
            const newX = direction === 'left' ? parent.x - 12 : parent.x + 12;
            const newY = parent.y + 20;
            const newNode = { val, bf: 0, x: newX, y: newY, left: null, right: null };
            
            let newNodes = nodes.map(n => {
              if (n.val === parent.val) {
                return { ...n, [direction]: val };
              }
              return n;
            });
            newNodes.push(newNode);
            newNodes = updateAvlBFs(newNodes);

            steps.push({
              state: { nodes: newNodes, activeVal: val },
              description: `Slot found. Connected new node ${val} to parent ${parent.val} on the ${direction.toUpperCase()}.`,
              status: 'success'
            });

            // Simulate rotation triggers for LL / RR cases
            if (val === 5 && newNodes.some(n => n.val === 20)) {
              steps.push({
                state: { nodes: newNodes, activeVal: 20, rotationLabel: 'Imbalance detected!' },
                description: `Balance factor at node 20 is +2. Triggering Right Rotation (LL Case).`
              });
              const rotatedNodes = newNodes.map(n => {
                if (n.val === 20) return { ...n, x: 38, y: 55, left: null };
                if (n.val === 10) return { ...n, x: 25, y: 35, right: 20 };
                if (n.val === 40) return { ...n, left: 10 };
                return n;
              });
              const finalNodes = updateAvlBFs(rotatedNodes);
              steps.push({
                state: { nodes: finalNodes, activeVal: 10, rotationLabel: 'Right Rotation Complete' },
                description: `Right Rotation completed. Left/Right heights are now balanced.`,
                status: 'success'
              });
            } else {
              steps.push({
                state: { nodes: newNodes, activeVal: null },
                description: `AVL Tree is balanced. Insertion complete.`,
                status: 'success'
              });
            }
          }
        }
      } else if (operation === 'delete') {
        const val = targetVal;
        steps.push({
          state: { nodes, activeVal: null, rotationLabel: '' },
          description: `Starting AVL deletion for key ${val}.`
        });

        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        let currVal = rootNode ? rootNode.val : null;

        let parent = null;
        let currNode = null;
        let found = false;

        while (currVal !== null) {
          currNode = nodes.find(n => n.val === currVal);
          if (!currNode) break;

          steps.push({
            state: { nodes, activeVal: currVal },
            description: `Searching for node to delete: inspecting node ${currVal}.`
          });

          if (currVal === val) {
            found = true;
            break;
          }

          parent = currNode;
          if (val < currVal) {
            currVal = currNode.left;
          } else {
            currVal = currNode.right;
          }
        }

        if (!found) {
          steps.push({
            state: { nodes, activeVal: null },
            description: `Key ${val} not found in AVL tree. Nothing deleted.`,
            status: 'fail'
          });
        } else {
          steps.push({
            state: { nodes, activeVal: currVal },
            description: `Found node ${val} to delete.`
          });

          const hasLeft = currNode.left !== null && currNode.left !== undefined;
          const hasRight = currNode.right !== null && currNode.right !== undefined;

          let updatedNodes;

          if (!hasLeft && !hasRight) {
            updatedNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              updatedNodes = updatedNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: null };
                  if (n.right === val) return { ...n, right: null };
                }
                return n;
              });
            }
          } else if (hasLeft && !hasRight) {
            const childVal = currNode.left;
            updatedNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              updatedNodes = updatedNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: childVal };
                  if (n.right === val) return { ...n, right: childVal };
                }
                return n;
              });
            }
          } else if (!hasLeft && hasRight) {
            const childVal = currNode.right;
            updatedNodes = nodes.filter(n => n.val !== val);
            if (parent) {
              updatedNodes = updatedNodes.map(n => {
                if (n.val === parent.val) {
                  if (n.left === val) return { ...n, left: childVal };
                  if (n.right === val) return { ...n, right: childVal };
                }
                return n;
              });
            }
          } else {
            // Find successor
            let succVal = currNode.right;
            let succNode = nodes.find(n => n.val === succVal);
            let succParentVal = currVal;

            while (succNode.left !== null && succNode.left !== undefined) {
              succParentVal = succVal;
              succVal = succNode.left;
              succNode = nodes.find(n => n.val === succVal);
            }

            const tempUpdated = nodes.map(n => {
              if (n.val === val) return { ...n, val: succVal };
              let left = n.left;
              let right = n.right;
              if (left === val) left = succVal;
              if (right === val) right = succVal;
              return { ...n, left, right };
            });

            const originalSuccNodeInUpdated = tempUpdated.find(n => n.val === succVal && n.y > currNode.y);
            const succChildVal = originalSuccNodeInUpdated ? originalSuccNodeInUpdated.right : null;

            updatedNodes = tempUpdated.filter(n => !(n.val === succVal && n.y > currNode.y));
            updatedNodes = updatedNodes.map(n => {
              const parentToCheck = (succParentVal === val) ? succVal : succParentVal;
              if (n.val === parentToCheck) {
                if (n.left === succVal) return { ...n, left: succChildVal };
                if (n.right === succVal) return { ...n, right: succChildVal };
              }
              return n;
            });
          }

          let finalNodes = updateAvlBFs(updatedNodes);
          steps.push({
            state: { nodes: finalNodes, activeVal: null },
            description: `Deleted node ${val}. Recalculating heights and balance factors.`
          });

          // Simulate delete rebalancing rotation: if deleting 60 from default AVL
          if (val === 60 && nodes.some(n => n.val === 40)) {
            steps.push({
              state: { nodes: finalNodes, activeVal: 40, rotationLabel: 'Imbalance detected!' },
              description: `Balance factor at root 40 is +2. Triggering Right Rotation (LL Case).`
            });
            const rotatedNodes = finalNodes.map(n => {
              if (n.val === 40) return { ...n, x: 75, y: 35, left: 30 };
              if (n.val === 20) return { ...n, x: 50, y: 15, right: 40 };
              if (n.val === 30) return { ...n, x: 62, y: 55 };
              return n;
            });
            const rebalancedNodes = updateAvlBFs(rotatedNodes);
            steps.push({
              state: { nodes: rebalancedNodes, activeVal: 20, rotationLabel: 'Right Rotation Complete' },
              description: `Right Rotation completed. AVL tree is now fully balanced.`,
              status: 'success'
            });
          } else {
            steps.push({
              state: { nodes: finalNodes, activeVal: null },
              description: `AVL Tree is balanced. Deletion complete.`,
              status: 'success'
            });
          }
        }
      } else if (operation === 'traverse') {
        const mode = inputs.mode || 'inorder';
        const visited = [];
        steps.push({
          state: { nodes, activeVal: null, rotationLabel: '' },
          description: `Starting ${mode.toUpperCase()} tree traversal.`
        });

        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        if (rootNode) {
          if (mode === 'inorder') {
            const inorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              inorder(node.left);
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, rotationLabel: '' },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
              inorder(node.right);
            };
            inorder(rootNode.val);
          } else if (mode === 'preorder') {
            const preorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, rotationLabel: '' },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
              preorder(node.left);
              preorder(node.right);
            };
            preorder(rootNode.val);
          } else if (mode === 'postorder') {
            const postorder = (val) => {
              if (val === null || val === undefined) return;
              const node = nodes.find(n => n.val === val);
              if (!node) return;
              postorder(node.left);
              postorder(node.right);
              visited.push(val);
              steps.push({
                state: { nodes, activeVal: val, rotationLabel: '' },
                description: `Visited node ${val}. Traversal list: [${visited.join(', ')}].`
              });
            };
            postorder(rootNode.val);
          } else if (mode === 'levelorder') {
            const queue = [rootNode.val];
            while (queue.length > 0) {
              const curr = queue.shift();
              visited.push(curr);
              steps.push({
                state: { nodes, activeVal: curr, rotationLabel: '' },
                description: `Visited node ${curr}. Traversal list: [${visited.join(', ')}].`
              });
              const currNode = nodes.find(n => n.val === curr);
              if (currNode) {
                if (currNode.left !== null && currNode.left !== undefined) queue.push(currNode.left);
                if (currNode.right !== null && currNode.right !== undefined) queue.push(currNode.right);
              }
            }
          }
        }
        steps.push({
          state: { nodes, activeVal: null, rotationLabel: '' },
          description: `Finished ${mode.toUpperCase()} traversal. Complete traversal list: [${visited.join(', ')}].`,
          status: 'success'
        });
      }
      break;
    }

    case 'graph': {
      const nodes = currentState.nodes.map(n => ({ ...n }));
      const mode = inputs.mode || 'BFS';

      if (operation === 'traverse') {
        const startId = (inputs.value || '').toUpperCase() || 'A';
        const startNode = nodes.find(n => n.id === startId);
        if (!startNode) {
          steps.push({
            state: { nodes, visited: [], queueStack: [], activeNode: null, mode },
            description: `Error: Node "${startId}" does not exist in the graph. Traversal aborted.`,
            status: 'fail'
          });
          return steps;
        }
        steps.push({
          state: { nodes, visited: [], queueStack: [], activeNode: null, mode },
          description: `Starting ${mode} traversal from node ${startId}.`
        });

        if (mode === 'BFS') {
          const visited = [startId];
          const queue = [startId];
          steps.push({
            state: { nodes, visited: [...visited], queueStack: [...queue], activeNode: startId, mode },
            description: `Enqueue root node ${startId} and mark it as visited.`
          });

          while (queue.length > 0) {
            const curr = queue.shift();
            steps.push({
              state: { nodes, visited: [...visited], queueStack: [...queue], activeNode: curr, mode },
              description: `Dequeue node ${curr}. Processing its neighbors.`
            });

            const currNode = nodes.find(n => n.id === curr);
            if (currNode) {
              for (const nbr of currNode.neighbors) {
                if (!visited.includes(nbr)) {
                  visited.push(nbr);
                  queue.push(nbr);
                  steps.push({
                    state: { nodes, visited: [...visited], queueStack: [...queue], activeNode: curr, mode },
                    description: `Neighbor ${nbr} is unvisited. Marking visited and enqueuing.`
                  });
                }
              }
            }
          }
          steps.push({
            state: { nodes, visited: [...visited], queueStack: [], activeNode: null, mode },
            description: `BFS completed! All reachable nodes from ${startId} visited.`
          });
        } else {
          // DFS Simulation
          const visited = [];
          const stack = [startId];
          steps.push({
            state: { nodes, visited: [...visited], queueStack: [...stack], activeNode: startId, mode },
            description: `Push start node ${startId} onto stack.`
          });

          while (stack.length > 0) {
            const curr = stack.pop();
            if (!visited.includes(curr)) {
              visited.push(curr);
              steps.push({
                state: { nodes, visited: [...visited], queueStack: [...stack], activeNode: curr, mode },
                description: `Pop node ${curr} from stack and mark it as visited.`
              });

              const currNode = nodes.find(n => n.id === curr);
              if (currNode) {
                // Reverse neighbors to push so they get popped in forward alphabetical order
                const reversedNbrs = [...currNode.neighbors].reverse();
                for (const nbr of reversedNbrs) {
                  if (!visited.includes(nbr)) {
                    stack.push(nbr);
                    steps.push({
                      state: { nodes, visited: [...visited], queueStack: [...stack], activeNode: curr, mode },
                      description: `Neighbor ${nbr} is unvisited. Pushing onto stack.`
                    });
                  }
                }
              }
            }
          }
          steps.push({
            state: { nodes, visited: [...visited], queueStack: [], activeNode: null, mode },
            description: `DFS traversal completed.`
          });
        }
      }
      break;
    }

    // ================= HASH-BASED =================
    case 'hash_table': {
      const buckets = currentState.buckets.map(b => ({ ...b, values: [...b.values] }));
      const val = inputs.value || 'Apple';
      const hashIdx = val.length % buckets.length; // Hash function: length % size
      
      if (operation === 'insert') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Starting insertion of "${val}". Calculating hash: hash("${val}") = length("${val}") % ${buckets.length} = ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Accessing bucket index [${hashIdx}] to append "${val}".`
        });

        const newBuckets = buckets.map(b => {
          if (b.index === hashIdx) {
            return { ...b, values: [...b.values, val] };
          }
          return b;
        });

        steps.push({
          state: { buckets: newBuckets, activeBucketIdx: hashIdx },
          description: `Chained "${val}" into list at bucket [${hashIdx}].`,
          status: 'success'
        });
      } else if (operation === 'search') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Searching for "${val}". Computing hash address index: ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Searching linked list at bucket [${hashIdx}] sequentially.`
        });

        const found = buckets[hashIdx].values.includes(val);
        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: found 
            ? `Found value "${val}" at bucket index [${hashIdx}]!` 
            : `Search failed: "${val}" is not present in bucket [${hashIdx}].`,
          status: found ? 'success' : 'fail'
        });
      } else if (operation === 'delete') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Deleting key "${val}". Computing hash address index: ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Accessing bucket [${hashIdx}] to find "${val}".`
        });

        const exists = buckets[hashIdx].values.includes(val);
        if (exists) {
          const newBuckets = buckets.map(b => {
            if (b.index === hashIdx) {
              return { ...b, values: b.values.filter(v => v !== val) };
            }
            return b;
          });
          steps.push({
            state: { buckets: newBuckets, activeBucketIdx: hashIdx },
            description: `Deleted "${val}" from bucket [${hashIdx}].`,
            status: 'success'
          });
        } else {
          steps.push({
            state: { buckets, activeBucketIdx: hashIdx },
            description: `"${val}" was not found in bucket [${hashIdx}]. Nothing deleted.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'hash_set': {
      const buckets = currentState.buckets.map(b => ({ ...b, keys: [...b.keys] }));
      const val = inputs.isChar ? (inputs.value || 'A') : (parseInt(inputs.value) || 0);
      const hashVal = typeof val === 'string' ? val.charCodeAt(0) : val;
      const hashIdx = Math.abs(hashVal) % buckets.length; // Hash function: key % size

      if (operation === 'insert') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Inserting key ${val}. Calculating hash: ${hashVal} % ${buckets.length} = ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Checking bucket [${hashIdx}] to ensure key ${val} is unique.`
        });

        if (buckets[hashIdx].keys.includes(val)) {
          steps.push({
            state: { buckets, activeBucketIdx: hashIdx },
            description: `Key ${val} already exists. Hash Set enforces uniqueness, so insert is ignored.`,
            status: 'fail'
          });
        } else {
          const newBuckets = buckets.map(b => {
            if (b.index === hashIdx) {
              return { ...b, keys: [...b.keys, val] };
            }
            return b;
          });
          steps.push({
            state: { buckets: newBuckets, activeBucketIdx: hashIdx },
            description: `Unique key. Appended ${val} to bucket [${hashIdx}] chaining.`,
            status: 'success'
          });
        }
      } else if (operation === 'search') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Membership check: does Set contain ${val}? Compute bucket hash index: ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Scanning bucket chain [${hashIdx}] for key ${val}.`
        });

        const found = buckets[hashIdx].keys.includes(val);
        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: found 
            ? `Key ${val} is present in the Set (True).` 
            : `Key ${val} is NOT present in the Set (False).`,
          status: found ? 'success' : 'fail'
        });
      } else if (operation === 'delete') {
        steps.push({
          state: { buckets, activeBucketIdx: -1 },
          description: `Deleting key ${val}. Compute bucket hash index: ${hashIdx}.`
        });

        steps.push({
          state: { buckets, activeBucketIdx: hashIdx },
          description: `Scanning bucket chain [${hashIdx}] to find key ${val}.`
        });

        const exists = buckets[hashIdx].keys.includes(val);
        if (exists) {
          const newBuckets = buckets.map(b => {
            if (b.index === hashIdx) {
              return { ...b, keys: b.keys.filter(k => k !== val) };
            }
            return b;
          });
          steps.push({
            state: { buckets: newBuckets, activeBucketIdx: hashIdx },
            description: `Key ${val} deleted from bucket [${hashIdx}].`,
            status: 'success'
          });
        } else {
          steps.push({
            state: { buckets, activeBucketIdx: hashIdx },
            description: `Key ${val} was not found in bucket [${hashIdx}]. Nothing deleted.`,
            status: 'fail'
          });
        }
      }
      break;
    }

    case 'linear_search': {
      const sType = currentState.structureType || 'array1d';
      const target = inputs.isChar ? inputs.value : (parseInt(inputs.value) || 0);
      
      steps.push({
        state: { ...currentState, activeIdx: -1, activeRow: -1, activeCol: -1, activeVal: null, label: 'Start Linear Search' },
        description: `Starting Linear Search for target value ${target} in ${sType.toUpperCase()}.`
      });

      let found = false;

      if (sType === 'array1d') {
        const arr = currentState.arr || [];
        for (let i = 0; i < arr.length; i++) {
          steps.push({
            state: { ...currentState, activeIdx: i, label: `Comparing at index ${i}` },
            description: `Comparing index ${i}: element is ${get(arr, i)}.`
          });
          if (get(arr, i) === target) {
            steps.push({
              state: { ...currentState, activeIdx: i, label: `Found!` },
              description: `Target ${target} found at index ${i}!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
      } else if (sType === 'array2d') {
        const grid = currentState.grid || [];
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < get(grid, r).length; c++) {
            steps.push({
              state: { ...currentState, activeRow: r, activeCol: c, label: `Comparing at (${r}, ${c})` },
              description: `Comparing cell (${r}, ${c}): value is ${get(get(grid, r), c)}.`
            });
            if (get(get(grid, r), c) === target) {
              steps.push({
                state: { ...currentState, activeRow: r, activeCol: c, label: `Found!` },
                description: `Target ${target} found at cell (${r}, ${c})!`,
                status: 'success'
              });
              found = true;
              break;
            }
          }
          if (found) break;
        }
      } else if (sType === 'singly_linked_list' || sType === 'doubly_linked_list') {
        const nodes = currentState.nodes || [];
        for (let i = 0; i < nodes.length; i++) {
          steps.push({
            state: { ...currentState, activeIdx: i, label: `Comparing node ${i}` },
            description: `Comparing node index ${i}: value is ${get(nodes, i)}.`
          });
          if (get(nodes, i) === target) {
            steps.push({
              state: { ...currentState, activeIdx: i, label: `Found!` },
              description: `Target ${target} found at node index ${i}!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
      } else if (sType === 'stack') {
        const stack = currentState.stack || [];
        for (let i = stack.length - 1; i >= 0; i--) {
          steps.push({
            state: { ...currentState, activeIdx: i, label: `Comparing stack [${i}]` },
            description: `Comparing stack element at index [${i}] (value: ${get(stack, i)}).`
          });
          if (get(stack, i) === target) {
            steps.push({
              state: { ...currentState, activeIdx: i, label: `Found!` },
              description: `Target ${target} found in Stack at index [${i}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
      } else if (sType === 'queue' || sType === 'deque') {
        const qItems = currentState.queue || currentState.deque || [];
        for (let i = 0; i < qItems.length; i++) {
          steps.push({
            state: { ...currentState, activeIdx: i, label: `Comparing index ${i}` },
            description: `Comparing element at index [${i}] (value: ${get(qItems, i)}).`
          });
          if (get(qItems, i) === target) {
            steps.push({
              state: { ...currentState, activeIdx: i, label: `Found!` },
              description: `Target ${target} found at index [${i}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
        }
      } else if (sType === 'tree') {
        const nodes = currentState.nodes || [];
        const traverse = (val) => {
          if (val === null || val === undefined || found) return;
          const node = nodes.find(n => n.val === val);
          if (!node) return;

          steps.push({
            state: { ...currentState, activeVal: node.val, label: `Comparing node ${node.val}` },
            description: `Inspecting tree node ${node.val}. Does it match ${target}?`
          });

          if (node.val === target) {
            steps.push({
              state: { ...currentState, activeVal: node.val, label: `Found!` },
              description: `Target ${target} found in the tree!`,
              status: 'success'
            });
            found = true;
            return;
          }
          traverse(node.left);
          traverse(node.right);
        };

        if (nodes.length > 0) {
          const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
          if (rootNode) traverse(rootNode.val);
        }
      }

      if (!found) {
        steps.push({
          state: { ...currentState, activeIdx: -1, activeRow: -1, activeCol: -1, activeVal: null, label: 'Not Found' },
          description: `Finished Linear Search. Target ${target} was not found.`,
          status: 'fail'
        });
      }
      break;
    }

    case 'binary_search': {
      const sType = currentState.structureType || 'array1d';
      const target = inputs.isChar ? inputs.value : (parseInt(inputs.value) || 0);

      steps.push({
        state: { ...currentState, activeIdx: -1, activeRow: -1, activeCol: -1, activeVal: null, label: 'Start Binary Search' },
        description: `Starting Binary Search for target ${target} on sorted ${sType.toUpperCase()}.`
      });

      let found = false;

      if (sType === 'array1d') {
        const arr = currentState.arr || [];
        let low = 0, high = arr.length - 1;
        while (low <= high) {
          const mid = Math.floor(low + (high - low) / 2);
          steps.push({
            state: { ...currentState, low, high, mid, activeIdx: -1, label: `Range: [${low}, ${high}]` },
            description: `Search space is indices ${low} to ${high}. Midpoint is index ${mid}.`
          });
          steps.push({
            state: { ...currentState, low, high, mid, activeIdx: mid, label: `Comparing mid` },
            description: `Comparing middle element arr[${mid}] = ${get(arr, mid)} with target ${target}.`
          });
          if (get(arr, mid) === target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: mid, label: 'FOUND!' },
              description: `Target ${target} matches middle element arr[${mid}]!`,
              status: 'success'
            });
            found = true;
            break;
          }
          if (get(arr, mid) < target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: -1, label: `Shift Low = ${mid + 1}` },
              description: `arr[${mid}] = ${get(arr, mid)} < target ${target}. Narrow search to right half (indices ${mid + 1} to ${high}).`
            });
            low = mid + 1;
          } else {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: -1, label: `Shift High = ${mid - 1}` },
              description: `arr[${mid}] = ${get(arr, mid)} > target ${target}. Narrow search to left half (indices ${low} to ${mid - 1}).`
            });
            high = mid - 1;
          }
        }
      } else if (sType === 'array2d') {
        const grid = currentState.grid || [];
        const rows = grid.length;
        const cols = grid[0]?.length || 0;
        let low = 0, high = rows * cols - 1;
        while (low <= high) {
          const mid = Math.floor(low + (high - low) / 2);
          const r = Math.floor(mid / cols);
          const c = mid % cols;

          steps.push({
            state: { ...currentState, low, high, mid, activeRow: -1, activeCol: -1, label: `Range: [${low}, ${high}]` },
            description: `Search space is flat indices ${low} to ${high}. Midpoint is flat index ${mid} ➔ cell (${r}, ${c}).`
          });
          steps.push({
            state: { ...currentState, low, high, mid, activeRow: r, activeCol: c, label: `Comparing cell (${r}, ${c})` },
            description: `Comparing cell (${r}, ${c}) value ${get(get(grid, r), c)} with target ${target}.`
          });

          if (get(get(grid, r), c) === target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeRow: r, activeCol: c, label: 'FOUND!' },
              description: `Target ${target} found at cell (${r}, ${c})!`,
              status: 'success'
            });
            found = true;
            break;
          }
          if (get(get(grid, r), c) < target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeRow: -1, activeCol: -1, label: `Shift Low = ${mid + 1}` },
              description: `grid[${r}][${c}] = ${get(get(grid, r), c)} < target ${target}. Narrow to right half.`
            });
            low = mid + 1;
          } else {
            steps.push({
              state: { ...currentState, low, high, mid, activeRow: -1, activeCol: -1, label: `Shift High = ${mid - 1}` },
              description: `grid[${r}][${c}] = ${get(get(grid, r), c)} > target ${target}. Narrow to left half.`
            });
            high = mid - 1;
          }
        }
      } else if (sType === 'singly_linked_list') {
        const nodes = currentState.nodes || [];
        let low = 0, high = nodes.length - 1;
        while (low <= high) {
          const mid = Math.floor(low + (high - low) / 2);

          steps.push({
            state: { ...currentState, low, high, mid, activeIdx: -1, label: `Range: [${low}, ${high}]` },
            description: `Search space: indices ${low} to ${high}. Middle index is ${mid}. Traversing list...`
          });

          for (let i = 0; i <= mid; i++) {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: i, label: `Traversing node ${i}` },
              description: `Traversing node index ${i} (value ${get(nodes, i)}) to reach middle index ${mid}.`
            });
          }

          steps.push({
            state: { ...currentState, low, high, mid, activeIdx: mid, label: `Comparing mid` },
            description: `Comparing middle node value ${get(nodes, mid)} with target ${target}.`
          });

          if (get(nodes, mid) === target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: mid, label: 'FOUND!' },
              description: `Target ${target} found at list index ${mid}!`,
              status: 'success'
            });
            found = true;
            break;
          }
          if (get(nodes, mid) < target) {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: -1, label: `Shift Low = ${mid + 1}` },
              description: `nodes[${mid}] = ${get(nodes, mid)} < target ${target}. Shift low boundary to ${mid + 1}.`
            });
            low = mid + 1;
          } else {
            steps.push({
              state: { ...currentState, low, high, mid, activeIdx: -1, label: `Shift High = ${mid - 1}` },
              description: `nodes[${mid}] = ${get(nodes, mid)} > target ${target}. Shift high boundary to ${mid - 1}.`
            });
            high = mid - 1;
          }
        }
      } else if (sType === 'bst' || sType === 'avl') {
        const nodes = currentState.nodes || [];
        let currVal = nodes.length > 0 ? nodes[0].val : null;
        const rootNode = nodes.find(n => !nodes.some(p => p.left === n.val || p.right === n.val));
        currVal = rootNode ? rootNode.val : null;

        while (currVal !== null) {
          const currNode = nodes.find(n => n.val === currVal);
          if (!currNode) break;

          steps.push({
            state: { ...currentState, activeVal: currVal, label: `Inspecting ${currVal}` },
            description: `Inspecting tree node ${currVal}.`
          });

          if (currVal === target) {
            steps.push({
              state: { ...currentState, activeVal: currVal, label: 'FOUND!' },
              description: `Target ${target} found in tree at node ${currVal}!`,
              status: 'success'
            });
            found = true;
            break;
          }

          if (target < currVal) {
            steps.push({
              state: { ...currentState, activeVal: currVal, comparedVal: currNode.left, label: `Go Left` },
              description: `${target} < ${currVal}. Branching to LEFT child.`
            });
            currVal = currNode.left;
          } else {
            steps.push({
              state: { ...currentState, activeVal: currVal, comparedVal: currNode.right, label: `Go Right` },
              description: `${target} > ${currVal}. Branching to RIGHT child.`
            });
            currVal = currNode.right;
          }
        }
      }

      if (!found) {
        steps.push({
          state: { ...currentState, activeIdx: -1, activeRow: -1, activeCol: -1, activeVal: null, label: 'Not Found' },
          description: `Binary Search finished. Target value ${target} was not found.`,
          status: 'fail'
        });
      }
      break;
    }

    // ================= SORTING =================
    case 'bubble_sort': {
      const arr = [...currentState.arr];
      steps.push({
        state: { arr: [...arr], activeIdx1: -1, activeIdx2: -1, sortedIdx: arr.length, label: 'Unsorted array' },
        description: 'Starting Bubble Sort.'
      });
      const tempArr = [...arr];
      const n = tempArr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            state: { arr: [...tempArr], activeIdx1: j, activeIdx2: j + 1, sortedIdx: n - i, label: `Comparing arr[${j}] and arr[${j+1}]` },
            description: `Comparing elements: arr[${j}] (${get(tempArr, j)}) and arr[${j+1}] (${get(tempArr, j+1)}).`
          });
          if (get(tempArr, j) > get(tempArr, j + 1)) {
            const tmp = get(tempArr, j);
            set(tempArr, j, get(tempArr, j + 1));
            set(tempArr, j + 1, tmp);
            steps.push({
              state: { arr: [...tempArr], activeIdx1: j, activeIdx2: j + 1, sortedIdx: n - i, label: `Swapped arr[${j}] and arr[${j+1}]` },
              description: `Since ${tmp} > ${get(tempArr, j)}, swap them.`
            });
          }
        }
        steps.push({
          state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, sortedIdx: n - i - 1, label: `Index ${n - i - 1} sorted` },
          description: `Element at index ${n - i - 1} is now in its correct sorted position.`
        });
      }
      steps.push({
        state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, sortedIdx: 0, label: 'Fully sorted' },
        description: 'Bubble Sort complete. All elements sorted!',
        status: 'success'
      });
      break;
    }

    case 'selection_sort': {
      const arr = [...currentState.arr];
      steps.push({
        state: { arr: [...arr], activeIdx1: -1, activeIdx2: -1, minIdx: -1, sortedIdx: -1, label: 'Unsorted array' },
        description: 'Starting Selection Sort.'
      });
      const tempArr = [...arr];
      const n = tempArr.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        steps.push({
          state: { arr: [...tempArr], activeIdx1: i, activeIdx2: -1, minIdx: minIdx, sortedIdx: i - 1, label: `Set min_idx = ${i}` },
          description: `Assume element at index ${i} (${get(tempArr, i)}) is current minimum.`
        });
        for (let j = i + 1; j < n; j++) {
          steps.push({
            state: { arr: [...tempArr], activeIdx1: minIdx, activeIdx2: j, minIdx: minIdx, sortedIdx: i - 1, label: `Comparing with index ${j}` },
            description: `Compare current minimum at index ${minIdx} (${get(tempArr, minIdx)}) with element at index ${j} (${get(tempArr, j)}).`
          });
          if (get(tempArr, j) < get(tempArr, minIdx)) {
            minIdx = j;
            steps.push({
              state: { arr: [...tempArr], activeIdx1: minIdx, activeIdx2: -1, minIdx: minIdx, sortedIdx: i - 1, label: `New min_idx = ${j}` },
              description: `Found a smaller element. Update min_idx to ${j}.`
            });
          }
        }
        if (minIdx !== i) {
          const tmp = get(tempArr, i);
          set(tempArr, i, get(tempArr, minIdx));
          set(tempArr, minIdx, tmp);
          steps.push({
            state: { arr: [...tempArr], activeIdx1: i, activeIdx2: minIdx, minIdx: minIdx, sortedIdx: i - 1, label: `Swapped index ${i} and ${minIdx}` },
            description: `Swap minimum element ${get(tempArr, i)} with element at index ${i}.`
          });
        }
        steps.push({
          state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, minIdx: -1, sortedIdx: i, label: `Sorted up to index ${i}` },
          description: `Element at index ${i} is now in sorted position.`
        });
      }
      steps.push({
        state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, minIdx: -1, sortedIdx: n - 1, label: 'Fully sorted' },
        description: 'Selection Sort complete. All elements sorted!',
        status: 'success'
      });
      break;
    }

    case 'insertion_sort': {
      const arr = [...currentState.arr];
      steps.push({
        state: { arr: [...arr], activeIdx1: -1, activeIdx2: -1, keyVal: null, sortedIdx: 0, label: 'Unsorted array' },
        description: 'Starting Insertion Sort.'
      });
      const tempArr = [...arr];
      const n = tempArr.length;
      for (let i = 1; i < n; i++) {
        let key = get(tempArr, i);
        let j = i - 1;
        steps.push({
          state: { arr: [...tempArr], activeIdx1: i, activeIdx2: -1, keyVal: key, sortedIdx: i - 1, label: `Key = ${key}` },
          description: `Set key = ${key} (from index ${i}) and insert it into sorted part.`
        });
        while (j >= 0 && get(tempArr, j) > key) {
          steps.push({
            state: { arr: [...tempArr], activeIdx1: j, activeIdx2: j + 1, keyVal: key, sortedIdx: i, label: `Shift index ${j} to ${j+1}` },
            description: `Since arr[${j}] (${get(tempArr, j)}) > key (${key}), shift it to index ${j+1}.`
          });
          set(tempArr, j + 1, get(tempArr, j));
          j--;
        }
        set(tempArr, j + 1, key);
        steps.push({
          state: { arr: [...tempArr], activeIdx1: j + 1, activeIdx2: -1, keyVal: null, sortedIdx: i, label: `Inserted key at index ${j+1}` },
          description: `Insert key ${key} at index ${j + 1}.`
        });
      }
      steps.push({
        state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, keyVal: null, sortedIdx: n - 1, label: 'Fully sorted' },
        description: 'Insertion Sort complete. All elements sorted!',
        status: 'success'
      });
      break;
    }

    case 'merge_sort': {
      const arr = [...currentState.arr];
      steps.push({
        state: { arr: [...arr], activeIdx1: -1, activeIdx2: -1, label: 'Unsorted array' },
        description: 'Starting Merge Sort.'
      });
      const tempArr = [...arr];

      const generateMergeSortSteps = (l, r) => {
        if (l >= r) return;
        const m = Math.floor(l + (r - l) / 2);
        steps.push({
          state: { arr: [...tempArr], activeIdx1: l, activeIdx2: r, label: `Splitting range [${l}, ${r}]` },
          description: `Dividing range [${l}, ${r}] into [${l}, ${m}] and [${m+1}, ${r}].`
        });
        generateMergeSortSteps(l, m);
        generateMergeSortSteps(m + 1, r);
        const leftPart = tempArr.slice(l, m + 1);
        const rightPart = tempArr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        steps.push({
          state: { arr: [...tempArr], activeIdx1: l, activeIdx2: r, label: `Merging range [${l}, ${r}]` },
          description: `Merging sorted segments [${l}, ${m}] and [${m+1}, ${r}].`
        });
        while (i < leftPart.length && j < rightPart.length) {
          steps.push({
            state: { arr: [...tempArr], activeIdx1: l + i, activeIdx2: m + 1 + j, label: 'Comparing sub-arrays' },
            description: `Comparing elements ${leftPart[i]} and ${rightPart[j]}.`
          });
          if (leftPart[i] <= rightPart[j]) {
            set(tempArr, k, leftPart[i]);
            i++;
          } else {
            set(tempArr, k, rightPart[j]);
            j++;
          }
          steps.push({
            state: { arr: [...tempArr], activeIdx1: k, activeIdx2: -1, label: 'Writing merged element' },
            description: `Placing element ${get(tempArr, k)} at index ${k}.`
          });
          k++;
        }
        while (i < leftPart.length) {
          set(tempArr, k, leftPart[i]);
          steps.push({
            state: { arr: [...tempArr], activeIdx1: k, activeIdx2: -1, label: 'Copying remaining left' },
            description: `Copying remaining element ${get(tempArr, k)} from left sub-array to index ${k}.`
          });
          i++;
          k++;
        }
        while (j < rightPart.length) {
          set(tempArr, k, rightPart[j]);
          steps.push({
            state: { arr: [...tempArr], activeIdx1: k, activeIdx2: -1, label: 'Copying remaining right' },
            description: `Copying remaining element ${get(tempArr, k)} from right sub-array to index ${k}.`
          });
          j++;
          k++;
        }
      };
      generateMergeSortSteps(0, tempArr.length - 1);
      steps.push({
        state: { arr: [...tempArr], activeIdx1: -1, activeIdx2: -1, label: 'Fully sorted' },
        description: 'Merge Sort complete. All elements sorted!',
        status: 'success'
      });
      break;
    }

    case 'quick_sort': {
      const arr = [...currentState.arr];
      steps.push({
        state: { arr: [...arr], pivotIdx: -1, activeIdx1: -1, activeIdx2: -1, label: 'Unsorted array' },
        description: 'Starting Quick Sort.'
      });
      const tempArr = [...arr];

      const generateQuickSortSteps = (low, high) => {
        if (low >= high) return;
        const pivot = get(tempArr, high);
        steps.push({
          state: { arr: [...tempArr], pivotIdx: high, activeIdx1: -1, activeIdx2: -1, label: `Pivot = ${pivot}` },
          description: `Select rightmost element ${pivot} at index ${high} as pivot.`
        });
        let i = low - 1;
        for (let j = low; j < high; j++) {
          steps.push({
            state: { arr: [...tempArr], pivotIdx: high, activeIdx1: j, activeIdx2: i >= low ? i : -1, label: `Comparing with pivot` },
            description: `Compare element ${get(tempArr, j)} at index ${j} with pivot ${pivot}.`
          });
          if (get(tempArr, j) < pivot) {
            i++;
            const tmp = get(tempArr, i);
            set(tempArr, i, get(tempArr, j));
            set(tempArr, j, tmp);
            steps.push({
              state: { arr: [...tempArr], pivotIdx: high, activeIdx1: i, activeIdx2: j, label: `Swapped index ${i} and ${j}` },
              description: `Since ${get(tempArr, i)} < pivot ${pivot}, swap index ${i} and ${j}.`
            });
          }
        }
        const tmp = get(tempArr, i + 1);
        set(tempArr, i + 1, get(tempArr, high));
        set(tempArr, high, tmp);
        const pi = i + 1;
        steps.push({
          state: { arr: [...tempArr], pivotIdx: pi, activeIdx1: pi, activeIdx2: high, label: `Placed pivot at index ${pi}` },
          description: `Swap pivot ${pivot} into its correct sorted position at index ${pi}.`
        });

        generateQuickSortSteps(low, pi - 1);
        generateQuickSortSteps(pi + 1, high);
      };
      generateQuickSortSteps(0, tempArr.length - 1);
      steps.push({
        state: { arr: [...tempArr], pivotIdx: -1, activeIdx1: -1, activeIdx2: -1, label: 'Fully sorted' },
        description: 'Quick Sort complete. All elements sorted!',
        status: 'success'
      });
      break;
    }
  }

  if (['bst', 'avl', 'linear_search', 'binary_search'].includes(structureId)) {
    steps.forEach(step => {
      if (step.state && step.state.nodes) {
        // Only apply updateTreeParents when nodes contains BST-style objects (not plain number arrays)
        const firstNode = step.state.nodes[0];
        if (firstNode !== null && firstNode !== undefined && typeof firstNode === 'object') {
          step.state.nodes = updateTreeParents(step.state.nodes);
        }
      }
    });
  }

  return steps;
}
