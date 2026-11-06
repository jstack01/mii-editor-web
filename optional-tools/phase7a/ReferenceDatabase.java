/* Analysis bridge to unmodified Alex9303/Mii-Database-Editor Util.java.
 * Creates a NEW synthetic database; cannot overwrite an existing database.
 * Not linked to, or distributed with, the browser editor. */
import java.nio.file.*;
import java.util.*;
public class ReferenceDatabase {
  public static void main(String[] args) throws Exception {
    byte[] db = Util.buildFile();
    List<String> records = Files.readAllLines(Path.of(args[0]));
    if (records.size() > 100) throw new IllegalArgumentException("Maximum 100 records");
    for (int i=0; i<records.size(); i++) {
      byte[] record = Util.hexStringToByteArray(records.get(i));
      if (record.length != 74) throw new IllegalArgumentException("Record must be 74 bytes");
      System.arraycopy(record,0,db,4+74*i,74);
    }
    byte[] crc = Util.calculateCRC16XModem(Arrays.copyOfRange(db,0,127454));
    System.arraycopy(crc,0,db,127454,2);
    Files.write(Path.of(args[1]),db,StandardOpenOption.CREATE_NEW);
  }
}
