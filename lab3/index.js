import { app, h, text } from "https://unpkg.com/hyperapp"
import { request } from "https://unpkg.com/@hyperapp/http"
import { every } from "https://unpkg.com/@hyperapp/time"

// -- HELPERS

// decorator for actions to fetch stories
const withFetch = state => [
    {
        ...state,
        fetching: true,
    },
    request({
        url: `https://zaceno.github.io/hatut/data/${state.filter.toLowerCase()}.json`,
        expect: "json",
        action: GotStories,
    })
]

// -- ACTIONS --

const StartEditingFilter = (state) => ({ ...state, editingFilter: true })

const StopEditingFilter = (state) => withFetch({ ...state, editingFilter: false })

const SetFilter = (state, event) => ({ ...state, filter: event.target.value })

const SelectStory = (state, id) => ({
    ...state,
    reading: id,
    stories: {
        ...state.stories,
        [id]: {
            ...state.stories[id],
            seen: true,
        },
    },
})

const GotStories = (state, stories) => ({
    ...state,
    fetching: false,
    stories: Object.keys(stories).map(id => [
        id,
        {
            ...stories[id],
            seen: state.stories[id] && state.stories[id].seen,
        },
    ]).reduce((o, [id, story]) => ((o[id] = story), o), {}),
    reading: stories[state.reading] ? state.reading : null,
})

const UpdateStories = (state) => withFetch(state)

const ToggleAutoUpdate = (state) => ({
    ...state,
    autoUpdate: !state.autoUpdate,
})

// -- VIEWS ---

const emphasize = (word, string) =>
    string
        .split(" ")
        .map((x) =>
            x.toLowerCase() === word.toLowerCase()
                ? h("em", {}, text(x + " "))
                : text(x + " "),
        )

const storyThumbnail = props => h("li", {
    onclick: [SelectStory, props.id], // <---
    class: {
        unread: props.unread,
        reading: props.reading,
    },
}, [
    h("p", { class: "title" }, emphasize(props.filter, props.title)),
    h("p", { class: "author" }, text(props.author)),
])

const storyList = props => h("div", { class: "stories" }, [

    props.fetching && h("div", { class: "loadscreen" }, [
        h("div", { class: "spinner" })
    ]),


    h("ul", {}, Object.keys(props.stories).map(id => storyThumbnail({
        id,
        title: props.stories[id].title,
        author: props.stories[id].author,
        unread: !props.stories[id].seen,
        reading: props.reading === id,
        filter: props.filter,
    }))),
])

const filterView = props => h("div", { class: "filter" }, [
    text("Filter:"),

    props.editingFilter
        ? h("input", {
            type: "text",
            value: props.filter,
            oninput: SetFilter,  // <---
        })
        : h("span", { class: "filter-word" }, text(props.filter)),

    props.editingFilter
        ? h("button", { onclick: StopEditingFilter }, text("\u2713"))
        : h("button", { onclick: StartEditingFilter }, text("\u270E")),
])


const storyDetail = props => h("div", { class: "story" }, [
    props && h("h1", {}, text(props.title)),
    props && h("p", {}, text(`
Lorem ipsum dolor sit amet, consectetur adipiscing
elit, sed do eiusmod tempor incididunt ut labore et
dolore magna aliqua. Ut enim ad minim veniam, qui
nostrud exercitation ullamco laboris nisi ut aliquip
ex ea commodo consequat.
`)),
    props && h("p", { class: "signature" }, text(props.author)),
])

const autoUpdateView = props => h("div", { class: "autoupdate" }, [
    text("Auto update: "),
    h("input", {
        type: "checkbox",
        checked: props.autoUpdate,
        oninput: ToggleAutoUpdate,
    }),
])

const container = content => h("div", { class: "container" }, content)

// -- RUN --
app({
    init: withFetch({
        editingFilter: false,
        autoUpdate: false,
        filter: "ocean",
        reading: null,
        stories: {},
    }),
    node: document.getElementById("app"),
    view: state => container([
        filterView(state),
        storyList(state),
        storyDetail(state.reading && state.stories[state.reading]),
        autoUpdateView(state),
    ]),
    subscriptions: state => [
        state.autoUpdate && every(5000, UpdateStories)
    ]
})