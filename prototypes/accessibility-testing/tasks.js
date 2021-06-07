const TASKS = [
  {
    id: 1,
    text: "lorem ipsum",
    buttonLinks: [
      {
        title: "Start task",
        href: "https://www.canada.ca/task-page.html",
        target: "_blank",
        classes: "btn-primary",
        spanClasses: "far fa-window-restore",
      },
      {
        title: "Post-task survey",
        href: "post-task-survey.html",
        classes: "btn-default",
      },
    ],

    answers: ["Answer a"],
  },
];

/* generate array of non-repeating random numbers, one for each task. Only call this function once for the whole survey */
function generateRandomOrder() {
  // e.g. [1,2,3,4,5,6,7]
  const taskIds = TASKS.map(({ id }) => id);
  // e.g. [5,2,6,3,7,1,4]
  const randOrder = taskIds.shuffle();

  // store it in localStorage (we only want to generate it once, use it many times)
  window.localStorage.setItem("randomOrder", JSON.stringify(randOrder));
}

function getNextRandomTask(currentTaskId) {
  const randOrderString = window.localStorage.getItem("randomOrder");
  const randOrder = JSON.parse(randOrderString);

  // find the index of the current task,
  const currentIdx = TASKS.findIndex((task) => task.id === currentTaskId);
  // return the task that's next in the list (TASKS[currentIdx+1])
  return TASKS[currentIdx + 1];
  // TODO: what if we're done?
}

function getCurrentTask() {
  // e.g. "" or "?step=5"
  const search = window.location.search;
  const stepString = search.slice("?step=".length);
  // TODO
}
