package mii.authoring
{
   public class CharacteristicsMole extends AbstractGUIPage
   {
      
      public function CharacteristicsMole(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 2;
         currPage = 0;
         currProp = "mole";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignOptionListeners(["X","Y","Size"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

