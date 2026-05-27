export type LessonStatus = "available" | "coming-soon";

export type Lesson = {
    id: string;
    order: number;
    title: string;
    description: string;
    href: string;
    status: LessonStatus;
};

export const lessons: Lesson[] = [
    {
        id: "capture",
        order: 1,
        title: "Bắt quân trong 1 nước",
        description: "Học cách nhìn khí cuối cùng của quân đối thủ và bắt quân.",
        href: "/learn/capture",
        status: "available",
    },
    {
        id: "atari",
        order: 2,
        title: "Atari: nhóm chỉ còn 1 khí",
        description:
            "Học cách nhận ra một nhóm quân đang nguy hiểm và tìm nước thoát Atari.",
        href: "/learn/atari",
        status: "available",
    },
    {
        id: "suicide",
        order: 3,
        title: "Nước tự sát",
        description: "Hiểu vì sao một số nước đi không hợp lệ trong cờ vây.",
        href: "/learn/suicide",
        status: "available",
    },
    {
        id: "ko",
        order: 4,
        title: "Luật Ko",
        description: "Hiểu luật chống lặp vô hạn trong cờ vây.",
        href: "/learn/ko",
        status: "available",
    },
    {
        id: "scoring",
        order: 5,
        title: "Đếm điểm cơ bản",
        description:
            "Hiểu cách kết thúc ván cờ và ước lượng ai đang dẫn điểm.",
        href: "/learn/scoring",
        status: "available",
    },
];

export function getLessonById(id: string) {
    return lessons.find((lesson) => lesson.id === id);
}

export function getNextLesson(currentLessonId: string) {
    const currentLesson = getLessonById(currentLessonId);

    if (!currentLesson) return null;

    return (
        lessons.find((lesson) => lesson.order === currentLesson.order + 1) ??
        null
    );
}