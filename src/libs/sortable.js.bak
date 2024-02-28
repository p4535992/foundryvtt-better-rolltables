// @href https://gist.github.com/code-boxx/45ebe489b99583dc170564113b1ad24e
//  instance : target html table
//  data : optional, generate table with this data
export function sortable(instance, data) {
  // (A) FLAGS
  instance.sBy = null; // sort by this column
  instance.sDirection = true; // ascending/descending order
  instance.sOrder = []; // calculated sort order

  // (B) SORT FUNCTION
  instance.sort = (selected) => {
    // (B1) UPDATE SORT FLAGS
    if (instance.sBy == selected.innerHTML) {
      instance.sDirection = !instance.sDirection;
    } else {
      instance.sBy = selected.innerHTML;
      instance.sDirection = true;
    }

    // (B2) UPDATE CSS OF HEADER CELLS
    for (let c of instance.head.rows[0].cells) {
      c.classList.remove("better-rolltables-sortup");
      c.classList.remove("better-rolltables-sortdown");
      if (c == selected) {
        c.classList.add(instance.sDirection ? "better-rolltables-sortup" : "better-rolltables-sortdown");
      }
    }

    // (B3) MAP OUT DATA OF THE SELECTED COLUMN
    // I.E. WE NEED TO RETAIN THE INDEX POSITIONS WHILE SORTING
    let map = data[selected.innerHTML].map((v, i) => {
      return { i: i, v: v };
    });

    // (B4) SORT ARRAY
    if (instance.sDirection) {
      map.sort((a, b) => {
        if (a.v > b.v) {
          return 1;
        }
        if (a.v < b.v) {
          return -1;
        }
        return 0;
      });
    } else {
      map.sort((a, b) => {
        if (a.v < b.v) {
          return 1;
        }
        if (a.v > b.v) {
          return -1;
        }
        return 0;
      });
    }

    // (B5) REDRAW TABLE WITH NEW SORT ORDER
    instance.sOrder = [];
    for (let idx in map) {
      instance.sOrder.push(map[idx].i);
    }
    instance.draw();
  };

  // (C) DRAW HTML TABLE
  instance.draw = () => {
    // (C1) REMOVE OLD SORT ORDER
    instance.body.innerHTML = "";

    // (C2) DRAW NEW SORT ORDER
    let r, c;
    for (let i of instance.sOrder) {
      r = instance.body.insertRow();
      for (let key in data) {
        c = r.insertCell();
        c.innerHTML = data[key][i];
      }
    }
  };

  // (D) ADAPT DATA FROM EXISTING TABLE
  if (data == undefined) {
    // (D1) GET TABLE SECTIONS
    instance.head = instance.querySelector("thead");
    instance.body = instance.querySelector("tbody");

    // (D2) GET DATA FROM HEADER
    data = {};
    let keys = [];
    for (let c of instance.head.rows[0].cells) {
      data[c.innerHTML] = [];
      keys.push(c.innerHTML);
    }

    // (D3) GET DATA FROM BODY
    for (let r of instance.body.rows) {
      for (let i = 0; i < r.cells.length; i++) {
        data[keys[i]].push(r.cells[i].innerHTML);
      }
    }
    keys = null;
  }

  // (E) DRAW SORTABLE TABLE FROM OBJECT
  else {
    // (E1) CREATE TABLE SECTIONS
    instance.head = instance.createTHead();
    instance.body = instance.createTBody();

    // (E2) HEADER CELLS
    let r = instance.head.insertRow();
    r = instance.head.rows[0];
    for (let key in data) {
      let c = r.insertCell();
      c.innerHTML = key;
    }

    // (E3) DEFAULT SORT ORDER & DRAW BODY
    for (let i = 0; i < data[Object.keys(data)[0]].length; i++) {
      instance.sOrder.push(i);
    }
    instance.draw();
  }

  // (F) CLICK ON HEADER CELL TO SORT
  instance.classList.add("better-rolltables-sorta");
  for (let r of instance.head.rows) {
    for (let c of r.cells) {
      c.onclick = () => instance.sort(c);
    }
  }
}
