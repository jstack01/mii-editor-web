package mii.fileio
{
   import flash.events.IEventDispatcher;
   
   public interface ILoad extends IEventDispatcher
   {
      
      function load() : void;
      
      function get data() : *;
      
      function loadURI(param1:String) : void;
   }
}

