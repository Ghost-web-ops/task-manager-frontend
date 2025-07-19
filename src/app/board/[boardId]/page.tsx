import BoardClient from './BoardClient';

// نحدد أن params ستكون Promise
interface BoardPageParams {
  params: Promise<{
    boardId: string;
  }>;
}

// نجعل المكون async لنتمكن من استخدام await
export default async function BoardPage({ params }: BoardPageParams) {
  // ✅ هنا نستخدم await لانتظار الـ Promise والحصول على قيمته
  const { boardId } = await params;

  // ثم نمرر القيمة النصية البسيطة إلى مكون العميل
  return <BoardClient boardId={boardId} />;
}