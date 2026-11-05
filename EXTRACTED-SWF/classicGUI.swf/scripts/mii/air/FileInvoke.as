package mii.air
{
   import flash.events.InvokeEvent;
   import flash.system.Shell;
   import mii.fileio.IInvoke;
   
   public class FileInvoke implements IInvoke
   {
      
      private var invokeHandler:Function;
      
      public function FileInvoke(param1:Function)
      {
         super();
         this.invokeHandler = param1;
         Shell.shell.addEventListener(InvokeEvent.INVOKE,invoke);
      }
      
      private function invoke(param1:InvokeEvent) : void
      {
         invokeHandler(param1.arguments);
      }
   }
}

