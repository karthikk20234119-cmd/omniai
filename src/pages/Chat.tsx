import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

export default function Chat() {
  return (
    <div className="flex flex-col h-full bg-background relative w-full overflow-hidden">
      <MessageList />
      <MessageInput />
    </div>
  );
}
