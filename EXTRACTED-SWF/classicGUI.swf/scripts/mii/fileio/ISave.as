package mii.fileio
{
   import flash.events.IEventDispatcher;
   
   public interface ISave extends IEventDispatcher
   {
      
      function get data() : *;
      
      function save(param1:*, param2:Object = null) : void;
   }
}

