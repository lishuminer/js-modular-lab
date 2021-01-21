function randomRobot(state) {
    return { direction: randomPick(roadGraph[state.place]) };
}